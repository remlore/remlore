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
  NotFoundException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EAccountProvider, UserDevice } from '@prisma/rem-ids/client'
import { PrismaService } from '@remlore/ids/prisma'
import { VerifyEmailCache } from '@remlore/ids/shared/utils'
import { randomString } from '@remlore/shared/util/fucns'
import { AuthResponse, RlResponse, Tokens } from '@remlore/shared/util/types'
import * as argon2 from 'argon2'
import { Queue } from 'bull'
import dayjs from 'dayjs'
import { InjectOidcProvider, InteractionHelper, Provider } from 'nest-oidc-provider'
import { Profile } from 'passport-google-oauth20'
import { Agent } from 'useragent'
import {
  ChangePasswordByOldPasswordDto,
  ChangePasswordByTokenDto,
  SignUpDto,
  VerifyEmailDto
} from './dto'

const EMAIL_LINK_EXP = 300_000

@Injectable()
export class AuthService {
  constructor(
    @InjectOidcProvider() private readonly provider: Provider,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    @InjectQueue('send-mail') private readonly mailQueue: Queue
  ) {}

  async signUp(dto: SignUpDto, agent: Agent, ip?: string): Promise<RlResponse> {
    try {
      const user = await this.prisma.user.findFirst({
        where: { email: dto.email },
        select: { email: true, googleId: true }
      })

      if (user?.email) {
        if (user.googleId) {
          throw new BadRequestException('user already register with google')
        }
        throw new ConflictException('email already used!')
      }

      const hash = await argon2.hash(dto.password, {
        secret: Buffer.from(this.config.get('ARGON2_HASH_PASSWORD') as string)
      })

      const token = randomString(200)
      console.log(token)

      await this.cache.set<VerifyEmailCache>(
        `${dto.email}-v`,
        {
          token,
          count: 0,
          cooldown: dayjs().add(60, 'seconds').unix()
        },
        EMAIL_LINK_EXP
      )

      let devices
      console.log('agent', agent)
      if (agent && dto.deviceId) {
        const device = agent.device.toString()
        const os = agent.os.toString()
        const browser = agent.toAgent()

        devices = {
          create: {
            deviceId: dto.deviceId,
            deviceType: `${device} - ${os} - ${browser}`,
            userAgent: agent.toString(),
            verified: true,
            isCurrent: true,
            lastLoginAt: new Date(),
            lastLoginIp: ip
          } as UserDevice
        }
      }

      console.log(devices?.create)

      await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
          provider: EAccountProvider.Email,
          profile: { create: {} },
          devices
        },
        select: { id: true, email: true }
      })

      await this.mailQueue.add(
        'verify-email',
        { email: dto.email, token },
        { removeOnComplete: true }
      )

      return {
        status: HttpStatus.CREATED,
        message: `We sent a verify email to ${dto.email}. Please check and verify.`
      }
    } catch (error) {
      console.log(error)
      throw new ForbiddenException('Credentials taken')
    }
  }

  async verifySignUpEmail(interaction: InteractionHelper, dto: VerifyEmailDto) {
    try {
      const verifyData = await this.cache.get<VerifyEmailCache>(`${dto.email}-v`)

      if (!verifyData) {
        throw new BadRequestException('verify link expired!')
      }

      if (verifyData.token !== dto.token) {
        throw new BadRequestException('hash token is not valid!')
      }

      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
        select: {
          id: true,
          email: true,
          verified: true
        }
      })

      if (!user) {
        throw new NotFoundException('email not registered!')
      }

      if (user.verified) {
        throw new BadRequestException('email already verified!')
      }

      await this.cache.del(dto.email)

      const result = {
        login: {
          accountId: user.id,
          remember: true
        },
        consent: {}
      }
      await interaction.finished(result, { mergeWithLastSubmission: false })
    } catch (error) {
      console.error(error)
      throw new ForbiddenException('Credentials taken')
    }
  }

  async sendVerifySignUpEMail(email: string) {
    try {
      const verifyData = await this.cache.get<VerifyEmailCache>(`${email}-v`)
      const token = randomString(200)
      let countSentEmail = 1

      if (!verifyData) {
        console.log(`${email}-vvvv`)
        await this.cache.set<VerifyEmailCache>(
          `${email}-v`,
          {
            count: countSentEmail,
            token,
            cooldown: dayjs().add(60, 'seconds').unix()
          },
          EMAIL_LINK_EXP
        )
      } else {
        countSentEmail = verifyData.count + 1
        if (countSentEmail >= 5) {
          throw this.tooManyRequestException()
        }

        console.log('verify cooldown', verifyData.cooldown, dayjs().unix())
        if (verifyData.cooldown > dayjs().unix()) {
          return {
            error: 'wait to for 1m after try again',
            status: HttpStatus.BAD_REQUEST,
            message: 'resend mail successful',
            countSentEmails: verifyData.count
          }
        }

        await this.cache.set<VerifyEmailCache>(
          `${email}-v`,
          {
            count: countSentEmail,
            token,
            cooldown: dayjs().add(60, 'seconds').unix()
          },
          EMAIL_LINK_EXP
        )
      }

      await this.mailQueue.add('verify-email', { email, token }, { removeOnComplete: true })

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
          `${email}-p`,
          {
            count: countSentEmail,
            token,
            cooldown: dayjs().add(60, 'seconds').unix()
          },
          EMAIL_LINK_EXP
        )
      } else {
        countSentEmail = changePasswordData.count + 1
        if (countSentEmail > 5) {
          throw this.tooManyRequestException()
        }

        if (changePasswordData.cooldown > dayjs().unix()) {
          return {
            error: 'wait to for 1m after try again',
            status: HttpStatus.BAD_REQUEST,
            message: 'resend mail successful',
            countSentEmails: changePasswordData.count
          }
        }

        await this.cache.set<VerifyEmailCache>(
          `${email}-p`,
          {
            count: countSentEmail,
            token,
            cooldown: dayjs().add(60, 'seconds').unix()
          },
          EMAIL_LINK_EXP
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
      throw new BadRequestException('Invalid email!')
    }

    if (verifyData.token !== dto.token) {
      throw new BadRequestException('token is not valid')
    }

    await this.cache.del(`${dto.email}-p`)

    const hash = await argon2.hash(dto.newPassword, {
      secret: Buffer.from(this.config.get('ARGON2_HASH_PASSWORD') as string)
    })

    const user = await this.prisma.user.update({
      where: { email: dto.email },
      data: { hash },
      select: { hash: true }
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
  ): Promise<RlResponse<AuthResponse<Tokens>>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          hash: true
        }
      })

      if (!user?.hash) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Old password is incorrect'
        }
      }

      const pwdMatch = await argon2.verify(user?.hash, dto.oldPassword, {
        secret: Buffer.from(this.config.get('ARGON2_HASH_PASSWORD') as string)
      })

      if (!pwdMatch) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Old password is incorrect'
        }
      }

      const hash = await argon2.hash(dto.newPassword, {
        secret: Buffer.from(this.config.get('ARGON2_HASH_PASSWORD') as string)
      })

      this.prisma.user.update({
        where: { id },
        data: { hash }
      })

      return {
        status: HttpStatus.OK,
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
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { googleId: true }
    })

    if (!user) {
      throw new Error('User not found.')
    }
    if (user.googleId) {
      throw new Error('Google account is already linked.')
    }

    await this.prisma.user.update({
      where: { id },
      data: { googleId }
    })
  }

  async unlinkGoogleAccount(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { googleId: true }
    })

    if (!user) {
      throw new Error('User not found.')
    }

    if (!user.googleId) {
      throw new Error('Google account is not linked.')
    }

    await this.prisma.user.update({
      where: { id },
      data: { googleId: null }
    })
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
            googleId: profile.id,
            provider: EAccountProvider.Email,
            verified: true,
            profile: {
              create: {
                photoUrl: profile.photos?.[0].value,
                displayName: profile.displayName
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

  private hashVerifyEmail(hash = false) {
    const token = randomString(200)
    if (!hash) {
      return token
    }
    const secret = Buffer.from(this.config.get('ARGON2_HASH_EMAIL_TOKEN') as string)

    return argon2.hash(token, { secret })
  }

  private tooManyRequestException() {
    return new HttpException(
      `email was sent more than 5 times. Try again after ${EMAIL_LINK_EXP} hours`,
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
}
