import { InjectQueue } from '@nestjs/bull'
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'
import { PrismaService } from '@rem.lore/api/prisma'
import { randomString } from '@rem.lore/shared/util/fucns'
import { AuthResponse, JWTEncode, MapedValue, Tokens, UserInfo } from '@rem.lore/shared/util/types'
import * as argon2 from 'argon2'
import { Queue } from 'bull'
import dayjs from 'dayjs'
import { Profile } from 'passport-google-oauth20'
import { of } from 'rxjs'
import {
  AuthChangePasswordDto,
  AuthChangePasswordWithTokenDto
} from './dto/auth-change-password.dto'
import { AuthSignInDto } from './dto/auth-sign-in.dto'
import { AuthSignUpDto } from './dto/auth-sign-up.dto'

const EMAIL_LINK_EXP = 43_200_000

@Injectable()
export class AuthService {
  private readonly defaultUserSelector: MapedValue<UserInfo, true> = {
    email: true,
    rem_loreUsername: true,
    displayName: true,
    photoUrl: true,
    verified: true,
    isRemLoreAccount: true
  }

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
    @InjectQueue('send-mail') private readonly mailQueue: Queue
  ) {}

  async signUp(dto: AuthSignUpDto): Promise<AuthResponse<Tokens>> {
    try {
      const user = await this.prisma.user.findFirst({
        where: { OR: [{ email: dto.email }, { username: dto.username }] },
        select: {
          email: true,
          username: true
        }
      })

      if (user?.username) throw new ConflictException('username alredy used!')
      if (user?.email) throw new ConflictException('email alredy used!')

      const hash = await argon2.hash(dto.password, {
        secret: Buffer.from(this.config.get('ARGON2_HASH_PW') as string)
      })

      const verifyhash = randomString(200)

      const hashVerify = await argon2.hash(verifyhash, {
        secret: Buffer.from(this.config.get('ARGON2_HASH_EMAIL') as string)
      })

      const newUser = await this.prisma.user.create({
        data: {
          email: dto.email,
          username: dto.username,
          hash,
          verify: {
            create: { hashVerify }
          }
        },
        select: { ...this.defaultUserSelector, userId: true }
      })

      await this.mailQueue.add(
        'verify-email',
        { email: dto.email, verifyhash },
        { removeOnComplete: true }
      )

      return {
        error: null,
        message: 'sign up successful',
        statusCode: 201,
        status: 'success',
        user: {
          ...newUser,
          accessToken: await this.getToken({ sub: newUser.userId, email: newUser.email })
        }
      }
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new ForbiddenException('Credentional taken')
      }
      throw error
    }
  }

  async verifyEmail(hash: string, userId: string): Promise<AuthResponse<Tokens>> {
    try {
      if (!hash) throw new BadRequestException()

      const user = await this.prisma.user.findUnique({
        where: { userId },
        select: {
          hashVerify: true,
          email: true,
          updatedAt: true
        }
      })

      if (!user?.hashVerify) throw new NotFoundException('user not found')

      const isExpired = dayjs(user?.updatedAt).add(EMAIL_LINK_EXP).isBefore(new Date())

      if (isExpired) throw new NotFoundException('verify link expired')

      const valid = await argon2.verify(user.hashVerify, hash, {
        secret: Buffer.from(this.config.get('ARGON2_HASH_EMAIL') as string)
      })

      if (!valid) throw new BadRequestException('hash token is not valid')

      const [accessToken, refreshToken] = await this.getToken(
        { sub: userId, email: user.email },
        true
      )

      const userUpdate = await this.prisma.user.update({
        where: { userId },
        data: {
          hashRt: await argon2.hash(refreshToken, {
            secret: Buffer.from(this.config.get('ARGON2_HASH_RT') as string)
          }),
          verified: true,
          hashVerify: null
        },
        select: this.defaultUserSelector
      })

      return {
        status: 'success',
        statusCode: 200,
        message: 'sign in successful!',
        error: null,
        user: { ...userUpdate, accessToken, refreshToken }
      }
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new ForbiddenException('Credentional taken')
      }
      throw error
    }
  }

  async resendVerifyMail(email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: { email: true, countSentEmails: true, updatedAt: true }
      })

      if (!user) throw new BadRequestException('email invalid')

      if (user.countSentEmails > 4) {
        throw new HttpException(
          `email was sent 5 times try again after ${EMAIL_LINK_EXP / 36_000_000} hours`,
          HttpStatus.TOO_MANY_REQUESTS
        )
      }

      if (user.countSentEmails > 0 && dayjs(user.updatedAt).add(30_000).isAfter(new Date()))
        throw new HttpException('wait to for 30s', HttpStatus.TOO_MANY_REQUESTS)

      const verifyhash = randomString(200)

      const hashVerify = await argon2.hash(verifyhash, {
        secret: Buffer.from(this.config.get('ARGON2_HASH_EMAIL') as string)
      })

      await this.prisma.user.update({
        where: { email },
        data: {
          hashVerify,
          countSentEmails: { increment: 1 }
        }
      })

      this.mailQueue.add('verify-email', { email, verifyhash }, { removeOnComplete: true })

      return {
        error: null,
        status: 200,
        message: 'resend mail successful',
        countSentEmails: user.countSentEmails + 1
      }
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new ForbiddenException('Credentional taken')
      }
      throw error
    }
  }

  async changePasswordWithToken(dto: AuthChangePasswordWithTokenDto) {
    return of(dto)
  }

  async sendVerifyChangePassword(email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: { email: true, countSentEmails: true, updatedAt: true }
      })

      if (!user) throw new BadRequestException('email invalid')

      if (user.countSentEmails > 4) {
        throw new HttpException(
          `email was sent 5 times try again after ${EMAIL_LINK_EXP / 36_000_000} hours`,
          HttpStatus.TOO_MANY_REQUESTS
        )
      }

      if (user.countSentEmails > 0 && dayjs(user.updatedAt).add(30_000).isAfter(new Date()))
        throw new HttpException('wait to for 30s', HttpStatus.TOO_MANY_REQUESTS)

      const verifyhash = randomString(200)

      const hashVerify = await argon2.hash(verifyhash, {
        secret: Buffer.from(this.config.get('ARGON2_HASH_EMAIL') as string)
      })

      await this.prisma.user.update({
        where: { email },
        data: {
          hashVerify,
          countSentEmails: { increment: 1 }
        }
      })

      this.mailQueue.add('verify-email', { email, verifyhash }, { removeOnComplete: true })

      return {
        error: null,
        status: 200,
        message: 'resend mail successful',
        countSentEmails: user.countSentEmails + 1
      }
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new ForbiddenException('Credentional taken')
      }
      throw error
    }
  }

  async signIn(dto: AuthSignInDto): Promise<AuthResponse<Tokens>> {
    try {
      const user = await this.prisma.user.findFirst({
        where: { OR: [{ email: dto.usernameOrEmail }, { username: dto.usernameOrEmail }] },
        select: { ...this.defaultUserSelector, hash: true, userId: true }
      })

      if (!user?.hash) {
        return {
          status: 'failed',
          user: null,
          statusCode: 401,
          message: 'username/email or password is incorrect',
          error: 'sign in fail'
        }
      }

      const pwdMatch = await argon2.verify(user?.hash, dto.password, {
        secret: Buffer.from(this.config.get('ARGON2_HASH_PW') as string)
      })

      if (!pwdMatch) {
        return {
          status: 'failed',
          user: null,
          statusCode: 401,
          message: 'username/email or password is incorrect',
          error: 'sign in fail'
        }
      }

      if (!user?.verified) {
        const accessToken = await this.getToken({ sub: user.userId, email: user.email })

        return {
          error: null,
          message: 'sign up successful',
          statusCode: 200,
          status: 'success',
          user: {
            displayName: user.displayName,
            email: user.email,
            isRemLoreAccount: user.isRemLoreAccount,
            photoUrl: user.photoUrl,
            rem_loreUsername: user.rem_loreUsername,
            verified: user.verified,
            accessToken
          }
        }
      }

      return this.signUser(user.userId, user.email)
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new ForbiddenException('Credentional taken')
      }
      throw error
    }
  }

  async signOut(refreshToken: string) {
    try {
      const { sub } = this.jwt.decode(refreshToken) as JWTEncode

      if (!sub) return true

      const user = await this.prisma.user.updateMany({
        where: { userId: sub, hashRt: { not: null } },
        data: { hashRt: null }
      })

      console.log(user)

      if (user) return true

      return false
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new ForbiddenException('Credentional taken')
      }
      throw error
    }
  }

  async verifyRt(userId?: string | null, refreshToken?: string | null) {
    if (!refreshToken || !userId) throw new ForbiddenException('Access Denied')

    const user = await this.prisma.user.findUnique({
      where: { userId },
      select: { ...this.defaultUserSelector, hashRt: true }
    })

    if (!user?.hashRt) throw new ForbiddenException('Access Denied')

    const rtMatched = await argon2.verify(user.hashRt, refreshToken, {
      secret: Buffer.from(this.config.get('ARGON2_HASH_RT') as string)
    })

    if (!rtMatched) throw new ForbiddenException('Access Denied')

    return this.getToken({ sub: userId, email: user.email })
  }

  async verifyAt(userId?: string): Promise<UserInfo | null> {
    if (!userId) throw new ForbiddenException('')

    return this.prisma.user.findUnique({
      where: { userId },
      select: { ...this.defaultUserSelector, userId: true }
    })
  }

  async signInAuth20(profile: Profile): Promise<AuthResponse<Tokens>> {
    try {
      let user = await this.prisma.user.findUnique({
        where: { email: profile.emails?.[0].value },
        select: { userId: true, email: true }
      })

      if (!user?.userId) {
        user = await this.prisma.user.create({
          data: {
            displayName: profile.displayName,
            email: profile.emails?.[0].value as string,
            photoUrl: profile.photos?.[0].value
          },
          select: { userId: true, email: true }
        })
      }

      return this.signUser(user.userId, user.email)
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new ForbiddenException('Credentional taken')
      }
      throw error
    }
  }

  async checkPermissionChangePassword(): Promise<boolean> {
    return !!this.prisma.user
  }

  async changePassword(dto: AuthChangePasswordDto) {}

  private async signUser(userId: string, email: string): Promise<AuthResponse<Tokens>> {
    const [accessToken, refreshToken] = await this.getToken({ sub: userId, email }, true)

    const userUpdate = await this.prisma.user.update({
      where: { userId },
      data: {
        hashRt: await argon2.hash(refreshToken, {
          secret: Buffer.from(this.config.get('ARGON2_HASH_RT') as string)
        })
      },
      select: this.defaultUserSelector
    })

    return {
      status: 'success',
      statusCode: 200,
      message: 'sign in successful!',
      error: null,
      user: { ...userUpdate, accessToken, refreshToken }
    }
  }

  private getToken(payload: JWTEncode): Promise<string>
  private getToken(payload: JWTEncode, refresh: boolean): Promise<[string, string]>
  private getToken(payload: JWTEncode, refresh?: boolean) {
    if (refresh) {
      return Promise.all([
        this.jwt.signAsync(payload, {
          expiresIn: this.config.get<string>('JWT_ACCESS_EXP'),
          secret: this.config.get<string>('JWT_ACCESS_SECRET')
        }),
        this.jwt.signAsync(payload, {
          expiresIn: this.config.get<string>('JWT_REFRESH_EXP'),
          secret: this.config.get<string>('JWT_REFRESH_SECRET')
        })
      ])
    }

    return this.jwt.signAsync(payload, {
      secret: this.config.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get<string>('JWT_ACCESS_EXP')
    })
  }
}
