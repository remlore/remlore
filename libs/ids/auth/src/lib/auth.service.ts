import { InjectQueue } from '@nestjs/bull'
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager'
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  Device,
  EAccountProvider,
  EUserStatus,
  PrismaService,
  User
} from '@remlore/ids/core/prisma'
import { VerifyEmailCache } from '@remlore/ids/shared/utils'
import { randomString } from '@remlore/shared/util/fucns'
import { RlResponse } from '@remlore/shared/util/types'
import { hash, verify } from 'argon2'
import { Queue } from 'bull'
import dayjs from 'dayjs'
import { Profile } from 'passport-google-oauth20'
import { IResult as UserAgent } from 'ua-parser-js'
import {
  ChangePasswordByOldPasswordDto,
  ChangePasswordByTokenDto,
  SignUpDto,
  VerifyEmailDto
} from './dto'

export interface SessionPayload {
  userId: string
  email: string
  isPending: boolean
  interactionUid: string | null
}

const EMAIL_LINK_EXP_MS = 300_000 // 5 min token TTL in Redis (ms)
const EMAIL_LINK_EXP_SEC = 300 // same in seconds for dayjs
const MAXIMUM_EMAIL_RESEND = 5
const RESEND_EMAIL_COOLDOWN_SEC = 60 // must wait 60s between resends
const MAXIMUM_ATTEMPTS_HOURS = 1 // must wait 1h after max resends reached

/** Short-lived session for Pending users — lets them resend verification */
const PENDING_SESSION_TTL_DAYS = 1
/** Full session for Active users */
const ACTIVE_SESSION_TTL_DAYS = 14

const cacheKey = {
  /** Token issued for email verification */
  verifyEmail: (token: string) => `verify-email:${token}`,
  /** Token issued for password-reset email */
  passwordReset: (token: string) => `password-reset:${token}`,
  /** Rate-limit bucket for password-reset email resends */
  passwordResetResend: (email: string) => `password-reset-resend:${email}`
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    @InjectQueue('send-mail') private readonly mailQueue: Queue
  ) {}

  async signUp(dto: SignUpDto, interactionUid?: string, agent?: UserAgent, ip: string = 'unknown') {
    let existingUser = await this.prisma.user.findFirst({
      where: { email: dto.email }
    })

    if (existingUser?.email) {
      throw new ConflictException('Email already used!')
    }

    try {
      const passwordHashed = await hash(dto.password, {
        secret: Buffer.from(this.config.get('ARGON2_HASH_PASSWORD') as string)
      })

      let device = await this.prisma.device.findUnique({
        where: { id: dto.deviceId }
      })

      if (!device) {
        let deviceType = 'unknown'
        if (agent) {
          const deviceName = agent.device.toString()
          const os = agent.os.toString()
          const browser = agent.browser.name
          deviceType = `${deviceName} - ${os} - ${browser}`
        }

        device = {
          id: dto.deviceId,
          deviceType
        } as Device
      }

      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          passwordHash: passwordHashed,
          displayName: dto.displayName,
          status: EUserStatus.Pending,
          profile: { create: {} },
          devices: {
            create: {
              userAgent: agent ? agent?.toString() : 'unknown',
              verified: true,
              isUsing: true,
              lastLoginAt: new Date(),
              lastLoginIp: ip,
              device: {
                connectOrCreate: {
                  where: { id: device.id },
                  create: device
                }
              }
            }
          },
          logins: {
            create: {
              loginProvider: EAccountProvider.Email,
              providerKey: dto.email
            }
          }
        }
      })

      const pendingSessionToken = await this.createSession(user.id, {
        agent: agent?.toString(),
        ip,
        isPending: true,
        interactionUid: interactionUid ?? null
      })

      await this.sendVerificationEmail(user, 1)

      return {
        message: `We sent a verification email to ${dto.email}. Please check your inbox.`,
        // Return a short-lived session token so the frontend can later call
        // POST /auth/resend-verification-email authenticated as this user.
        pendingSessionToken,
        pendingSessionExpiresAt: dayjs().add(PENDING_SESSION_TTL_DAYS, 'day').unix()
      }
    } catch (error) {
      console.error('[signUp]', error)
      throw new InternalServerErrorException('Account creation failed.')
    }
  }

  /**
   * Verifies the email token.
   * The session cookie tells us WHO the user is — no need to pass userId in the body.
   * After verification, upgrades the session from pending → active.
   * If a OIDC interactionUid was stored in the session, resumes the OAuth flow.
   */
  async verifySignUpEmail(
    dto: VerifyEmailDto,
    sessionPayload: SessionPayload,
    userAgent?: UserAgent,
    ip?: string
  ) {
    const { userId, isPending, interactionUid } = sessionPayload

    if (!isPending) {
      throw new BadRequestException('Account is already verified.')
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new UnauthorizedException('Session is invalid.')
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified.')
    }

    const verifyCacheKey = cacheKey.verifyEmail(dto.token)
    const cached = await this.cache.get<VerifyEmailCache>(verifyCacheKey)

    if (cached) {
      if (cached.email !== user.email) {
        throw new BadRequestException('Verification token does not match your account.')
      }
    } else {
      const emailVerification = await this.prisma.emailVerification.findFirst({
        where: { userId, token: dto.token }
      })

      if (!emailVerification) {
        throw new BadRequestException('Invalid verification link!')
      }

      if (emailVerification.userId !== userId) {
        throw new BadRequestException('Verification token does not match your account.')
      }

      if (emailVerification.expiresAt < new Date()) {
        throw new BadRequestException('Verify link expired!')
      }
    }

    return this.activateUser(user.id, user.email, dto.token, {
      interactionUid: interactionUid ?? null,
      agent: userAgent?.toString(),
      ip
    })
  }

  async resendVerificationEmail(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified')
    }

    const verifyCacheKey = cacheKey.verifyEmail(user.email)
    const verifyData = await this.cache.get<VerifyEmailCache>(verifyCacheKey)

    if (verifyData) {
      if (verifyData.count >= MAXIMUM_EMAIL_RESEND) {
        throw new BadRequestException(
          `Maximum resend attempts (${MAXIMUM_EMAIL_RESEND}) reached. Please wait ${EMAIL_LINK_EXP_SEC / 60} minutes.`
        )
      }

      if (verifyData.nextAllowedAt > dayjs().unix()) {
        const waitSec = verifyData.nextAllowedAt - dayjs().unix()
        throw new BadRequestException(`Please wait for ${waitSec} seconds before trying again.`)
      }
    }

    const newCount = (verifyData?.count ?? 0) + 1
    await this.sendVerificationEmail(user, newCount)

    return {
      success: true,
      message: 'Verification email sent.',
      attemptNumber: newCount,
      attemptsRemaining: MAXIMUM_EMAIL_RESEND - newCount
    }
  }

  async sendChangePasswordEmail(email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true }
      })

      if (!user) {
        throw new NotFoundException('user not found')
      }

      const changePasswordData = await this.cache.get<VerifyEmailCache>(`${email}-p`)
      const token = randomString(200)
      let countSentEmail = 1

      if (!changePasswordData) {
        await this.cache.set<VerifyEmailCache>(
          token,
          {
            count: countSentEmail,
            email,
            nextAllowedAt: dayjs().add(60, 'seconds').unix()
          },
          EMAIL_LINK_EXP_MS
        )
      } else {
        countSentEmail = changePasswordData.count + 1
        if (countSentEmail > 5) {
          throw this.tooManyRequestException()
        }

        if (changePasswordData.nextAllowedAt > dayjs().unix()) {
          return {
            error: 'wait to for 1m after try again',
            status: HttpStatus.BAD_REQUEST,
            message: 'resend mail successful',
            countSentEmails: changePasswordData.count
          }
        }

        await this.cache.set<VerifyEmailCache>(
          token,
          {
            count: countSentEmail,
            email,
            nextAllowedAt: dayjs().add(60, 'seconds').unix()
          },
          EMAIL_LINK_EXP_MS
        )
      }

      await this.mailQueue.add('change-password', { email, token }, { removeOnComplete: true })

      return {
        error: null,
        status: 200,
        message: 'resend mail successful',
        countSentEmails: countSentEmail
      }
    } catch (error) {
      console.error(error)
      throw new ForbiddenException('Credentials taken')
    }
  }

  async changePasswordByToken(dto: ChangePasswordByTokenDto) {
    const verifyData = await this.cache.get<VerifyEmailCache>(`${dto.email}-p`)

    console.log(verifyData)
    if (!verifyData) {
      throw new BadRequestException('Token is not valid!')
    }

    await this.cache.del(`${dto.email}-p`)

    const passwordHash = await hash(dto.newPassword, {
      secret: Buffer.from(this.config.get('ARGON2_HASH_PASSWORD') as string)
    })

    const user = await this.prisma.user.update({
      where: { email: dto.email },
      data: { passwordHash },
      select: { passwordHash: true }
    })
    console.log(user)

    return {
      status: HttpStatus.OK,
      message: 'Change password successful!'
    }
  }

  async changePasswordByOldPassword(
    id: string,
    dto: ChangePasswordByOldPasswordDto
  ): Promise<RlResponse> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          passwordHash: true
        }
      })

      if (!user?.passwordHash) {
        return {
          success: false,
          message: 'Password is incorrect'
        }
      }

      const pwdMatch = await verify(user?.passwordHash, dto.oldPassword, {
        secret: Buffer.from(this.config.get('ARGON2_HASH_PASSWORD') as string)
      })

      if (!pwdMatch) {
        return {
          success: false,
          message: 'Password is incorrect'
        }
      }

      const passwordHash = await hash(dto.newPassword, {
        secret: Buffer.from(this.config.get('ARGON2_HASH_PASSWORD') as string)
      })

      this.prisma.user.update({
        where: { id },
        data: { passwordHash }
      })

      return {
        success: true,
        message: 'Change password successful!'
      }
    } catch (error) {
      console.error(error)
      throw new BadRequestException('Credentials taken')
    }
  }

  // to do
  // async verifyDevice(dto, user) {
  //   const device = await this.prisma.userDevice.findUnique({ where: { deviceId, userId } });

  //   if (!device) throw new NotFoundException('Device not found');
  //   if (device.verified) throw new ConflictException('Device already verified');

  //   const verifyData = await this.cache.get<OtpJobData>(`${dto.email}-d`)

  //     if (!verifyData) {
  //       throw new BadRequestException('verify link expired!')
  //     }

  //     if (verifyData.token !== dto.token) {
  //       throw new BadRequestException('hash token is not valid!')
  //     }
  //   // Validate code (implement your OTP logic)
  //   if (!(await this.authService.validateVerificationCode(userId, code))) {
  //     throw new BadRequestException('Invalid verification code');
  //   }

  //   await this.prisma.userDevice.update({
  //     where: { deviceId },
  //     data: { verified: true },
  //   });

  //   return { message: 'Device verified successfully' };
  // }

  async linkGoogleAccount(id: string, googleId: string) {
    const users = await this.prisma.userLogin.findMany({
      where: { userId: id },
      select: { loginProvider: true, providerKey: true }
    })

    if (!users) {
      throw new Error('User not found.')
    }
    if (users.find((u) => u.loginProvider === EAccountProvider.Google)) {
      throw new Error('Google account is already linked.')
    }

    await this.prisma.userLogin.create({
      data: {
        userId: id,
        loginProvider: EAccountProvider.Google,
        providerKey: googleId
      }
    })
  }

  async unlinkGoogleAccount(userId: string) {
    const users = await this.prisma.userLogin.findMany({
      where: { userId },
      select: { loginProvider: true, providerKey: true }
    })

    if (!users.length) {
      throw new Error('User not found.')
    }

    if (!users.find((u) => u.loginProvider === EAccountProvider.Google)?.providerKey) {
      throw new Error('Google account is not linked.')
    }

    await this.prisma.userLogin.delete({
      where: { userId_loginProvider: { userId, loginProvider: EAccountProvider.Google } }
    })
  }

  /**
   * Validates a raw session token (from cookie) and returns the session payload.
   * Used by controller/guard to authenticate pending-session endpoints.
   */
  async resolveSession(token: string): Promise<SessionPayload> {
    const session = await this.prisma.session.findUnique({
      where: { token },
      include: { user: { select: { id: true, email: true } } }
    })

    if (!session) {
      throw new UnauthorizedException('Session not found or expired.')
    }

    if (session.expiresAt < new Date()) {
      // Clean up expired session
      await this.prisma.session.delete({ where: { id: session.id } })
      throw new UnauthorizedException('Session has expired.')
    }

    return {
      userId: session.userId,
      email: session.user.email,
      isPending: session.isPending,
      interactionUid: session.interactionUid ?? null
    }
  }

  async signOut(id: string) {
    try {
      await this.prisma.user.update({
        where: { id, hashRt: { not: null } },
        data: { hashRt: null }
      })

      return true
    } catch (error) {
      console.log(error)
      throw new ForbiddenException('Credentials taken')
    }
  }

  async signInAuth20(profile: Profile) {
    try {
      let user = await this.prisma.user.findUnique({
        where: { email: profile.emails?.[0].value },
        select: { id: true, email: true }
      })

      if (!user?.id) {
        user = await this.prisma.user.create({
          data: {
            email: profile.emails?.[0].value as string,
            emailVerified: true,
            displayName: profile.displayName,
            profile: {
              create: {
                photoUrl: profile.photos?.[0].value
              }
            }
          },
          select: { id: true, email: true }
        })
      }

      return {
        message: 'sign in google ok'
      }
    } catch (error) {
      console.log(error)
      throw new ForbiddenException('Credentials taken')
    }
  }

  private tooManyRequestException() {
    return new HttpException(
      `email was sent more than 5 times. Try again after ${MAXIMUM_ATTEMPTS_HOURS} hours`,
      HttpStatus.TOO_MANY_REQUESTS
    )
  }

  async hasLoggedInFromOtherDevices(userId: string, currentDeviceId: string) {
    const otherDeviceLogins = await this.prisma.userDevice.findMany({
      where: {
        userId,
        deviceId: currentDeviceId
      }
    })

    return otherDeviceLogins.length > 0
  }

  /**
   * Creates a session record. TTL differs based on user status:
   *  - Pending → 1 day  (just enough to resend verification)
   *  - Active  → 14 days
   */
  async createSession(
    userId: string,
    options: {
      agent?: string
      ip?: string
      isPending?: boolean
      interactionUid?: string | null
    }
  ): Promise<string> {
    const token = randomString(64)
    const { agent, ip, isPending = false, interactionUid = null } = options

    const ttlDays = isPending ? PENDING_SESSION_TTL_DAYS : ACTIVE_SESSION_TTL_DAYS

    await this.prisma.session.create({
      data: {
        userId,
        token,
        userAgent: agent,
        ipAddress: ip,
        isPending,
        interactionUid,
        expiresAt: dayjs().add(ttlDays, 'days').toDate()
      }
    })

    return token
  }

  /**
   * Generates a verification token, persists it to both Redis and the DB,
   * updates the resend rate-limit bucket, and enqueues the email.
   */
  private async sendVerificationEmail(user: User, attemptNumber: number) {
    const token = randomString(64)
    const expiresAt = dayjs().add(EMAIL_LINK_EXP_SEC, 'seconds').toDate()

    // Persist to Redis (fast lookup during verify)
    await this.cache.set<VerifyEmailCache>(
      cacheKey.verifyEmail(token),
      {
        email: user.email,
        nextAllowedAt: dayjs().add(RESEND_EMAIL_COOLDOWN_SEC, 'seconds').unix(),
        count: attemptNumber
      },
      EMAIL_LINK_EXP_MS
    )

    await this.prisma.emailVerification.create({
      data: { userId: user.id, token, expiresAt }
    })

    // Update resend rate-limit bucket
    await this.cache.set<VerifyEmailCache>(
      cacheKey.verifyEmail(user.email),
      {
        count: attemptNumber,
        email: user.email,
        nextAllowedAt: dayjs().add(RESEND_EMAIL_COOLDOWN_SEC, 'seconds').unix()
      },
      EMAIL_LINK_EXP_MS
    )

    await this.mailQueue.add(
      'verify-email',
      { email: user.email, token },
      { removeOnComplete: true }
    )
  }

  /**
   * Shared logic for upgrading a user from Pending → Active.
   * Deletes the pending (short TTL) session and issues a full-privilege one.
   */
  private async activateUser(
    userId: string,
    email: string,
    verificationToken: string,
    options: {
      interactionUid?: string | null
      agent?: string
      ip?: string
    } = {}
  ) {
    const { interactionUid, agent, ip } = options

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { emailVerified: true, status: EUserStatus.Active }
      }),
      // Clean up DB verification record if it exists
      this.prisma.emailVerification.deleteMany({ where: { userId } })
    ])

    // Delete all existing (pending) sessions for this user
    await this.prisma.session.deleteMany({ where: { userId } })

    // Purge Redis token
    await this.cache.del(cacheKey.verifyEmail(verificationToken))

    // Issue new full-privilege session
    const sessionToken = await this.createSession(userId, {
      agent,
      ip,
      isPending: false,
      interactionUid: null
    })

    const expiresAt = dayjs().add(ACTIVE_SESSION_TTL_DAYS, 'days').toDate()

    return {
      message: 'Email verified successfully.',
      user: { id: userId, email },
      session: { token: sessionToken, expiresAt },
      interactionUid: interactionUid ?? null
    }
  }
}
