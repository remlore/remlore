import { Injectable } from '@nestjs/common'

const EMAIL_LINK_EXP = 300_000

@Injectable()
export class AuthService {
  // constructor(
  //   private readonly prisma: PrismaService,
  //   private readonly config: ConfigService,
  //   private readonly jwt: JwtService,
  //   @Inject(CACHE_MANAGER) private readonly cache: Cache,
  //   @InjectQueue('send-mail') private readonly mailQueue: Queue
  // ) {}
  // async signUp(dto: SignUpDto): Promise<AuthResponse<Tokens>> {
  //   try {
  //     const user = await this.prisma.user.findFirst({
  //       where: { email: dto.email },
  //       select: { email: true, googleId: true }
  //     })
  //     if (user?.email) {
  //       if (user.googleId) {
  //         throw new BadRequestException('user already register with google')
  //       }
  //       throw new ConflictException('email tokenHash used!')
  //     }
  //     const hash = await argon2.hash(dto.password, {
  //       secret: Buffer.from(this.config.get('ARGON2_HASH_PASSWORD') as string)
  //     })
  //     const token = randomString(200)
  //     await this.cache.set<VerifyEmailCache>(
  //       dto.email,
  //       {
  //         token,
  //         count: 0,
  //         cooldown: dayjs().add(60, 'seconds').unix()
  //       },
  //       EMAIL_LINK_EXP
  //     )
  //     const newUser = await this.prisma.user.create({
  //       data: {
  //         email: dto.email,
  //         hash,
  //         provider: EAccountProvider.Email,
  //         profile: { create: {} },
  //         verify: { create: {} }
  //       },
  //       select: { id: true, email: true }
  //     })
  //     await this.mailQueue.add(
  //       'verify-email',
  //       { email: dto.email, token },
  //       { removeOnComplete: true }
  //     )
  //     return this.signInUser(newUser.id, newUser.email, false)
  //   } catch (error) {
  //     console.log(error)
  //     throw new ForbiddenException('Credentials taken')
  //   }
  // }
  // async verifySignUpEmail(dto: VerifyEmailDto): Promise<AuthResponse<Tokens>> {
  //   try {
  //     const verifyData = await this.cache.get<VerifyEmailCache>(`${dto.email}-v`)
  //     if (!verifyData) {
  //       throw new BadRequestException('verify link expired!')
  //     }
  //     if (verifyData.token !== dto.token) {
  //       throw new BadRequestException('hash token is not valid!')
  //     }
  //     const user = await this.prisma.user.findUnique({
  //       where: { email: dto.email },
  //       select: {
  //         id: true,
  //         email: true,
  //         verify: { select: { verified: true } }
  //       }
  //     })
  //     if (!user) {
  //       throw new NotFoundException('email not registered!')
  //     }
  //     if (user.verify?.verified) {
  //       throw new BadRequestException('email already verified!')
  //     }
  //     await this.cache.del(dto.email)
  //     const [accessToken, refreshToken] = await this.getToken(
  //       { sub: user.id, email: user.email },
  //       true
  //     )
  //     await this.prisma.verify.update({
  //       where: { userId: user.id },
  //       data: {
  //         hashRt: await argon2.hash(refreshToken, {
  //           secret: Buffer.from(this.config.get('ARGON2_HASH_RT') as string)
  //         }),
  //         verified: true
  //       }
  //     })
  //     return {
  //       status: 'success',
  //       statusCode: 200,
  //       message: 'sign in successful!',
  //       error: null,
  //       user: { id: user.id, email: user.email, accessToken, refreshToken }
  //     }
  //   } catch (error) {
  //     console.error(error)
  //     throw new ForbiddenException('Credentials taken')
  //   }
  // }
  // async sendVerifySignUpEMail(email: string) {
  //   try {
  //     const verifyData = await this.cache.get<VerifyEmailCache>(`${email}-v`)
  //     const token = randomString(200)
  //     let countSentEmail = 0
  //     if (!verifyData) {
  //       await this.cache.set<VerifyEmailCache>(
  //         `${email}-v`,
  //         {
  //           count: 0,
  //           token,
  //           cooldown: Date.now()
  //         },
  //         EMAIL_LINK_EXP
  //       )
  //     } else {
  //       countSentEmail = verifyData.count
  //       if (countSentEmail > 4) {
  //         throw this.tooManyRequestException()
  //       }
  //       console.log('verify cooldown', verifyData.cooldown, Date.now())
  //       if (verifyData.cooldown < dayjs().unix()) {
  //         return {
  //           error: 'wait to for 1m after try again',
  //           status: HttpStatus.BAD_REQUEST,
  //           message: 'resend mail successful',
  //           countSentEmails: countSentEmail + 1
  //         }
  //       }
  //       await this.cache.set<VerifyEmailCache>(
  //         `${email}-v`,
  //         {
  //           count: countSentEmail + 1,
  //           token,
  //           cooldown: dayjs().add(60, 'seconds').unix()
  //         },
  //         EMAIL_LINK_EXP
  //       )
  //     }
  //     await this.mailQueue.add('verify-email', { email, token }, { removeOnComplete: true })
  //     return {
  //       error: null,
  //       status: 200,
  //       message: 'resend mail successful',
  //       countSentEmails: countSentEmail + 1
  //     }
  //   } catch (error) {
  //     console.error(error)
  //     throw new ForbiddenException('Credentials taken')
  //   }
  // }
  // async sendChangePasswordEmail(email: string) {
  //   try {
  //     const user = await this.prisma.user.findUnique({
  //       where: { email },
  //       select: { id: true, email: true, remloreUsername: true }
  //     })
  //     if (!user) {
  //       throw new NotFoundException('user not found')
  //     }
  //     const changePasswordData = await this.cache.get<VerifyEmailCache>(`${email}-p`)
  //     const token = randomString(200)
  //     let countSentEmail = 0
  //     if (!changePasswordData) {
  //       await this.cache.set<VerifyEmailCache>(
  //         `${email}-p`,
  //         {
  //           count: 0,
  //           token,
  //           cooldown: dayjs().add(60, 'seconds').unix()
  //         },
  //         EMAIL_LINK_EXP
  //       )
  //     } else {
  //       countSentEmail = changePasswordData.count
  //       if (countSentEmail > 5) {
  //         throw this.tooManyRequestException()
  //       }
  //       if (changePasswordData.cooldown < dayjs().unix()) {
  //         return {
  //           error: 'wait to for 1m after try again',
  //           status: HttpStatus.BAD_REQUEST,
  //           message: 'resend mail successful',
  //           countSentEmails: countSentEmail + 1
  //         }
  //       }
  //       await this.cache.set<VerifyEmailCache>(
  //         `${email}-p`,
  //         {
  //           count: countSentEmail + 1,
  //           token,
  //           cooldown: dayjs().add(60, 'seconds').unix()
  //         },
  //         EMAIL_LINK_EXP
  //       )
  //     }
  //     await this.mailQueue.add(
  //       'change-password',
  //       { email, token, remloreUsername: user.remloreUsername },
  //       { removeOnComplete: true }
  //     )
  //     return {
  //       error: null,
  //       status: 200,
  //       message: 'resend mail successful',
  //       countSentEmails: countSentEmail + 1
  //     }
  //   } catch (error) {
  //     console.error(error)
  //     throw new ForbiddenException('Credentials taken')
  //   }
  // }
  // async changePasswordByToken(dto: ChangePasswordByTokenDto) {
  //   const verifyData = await this.cache.get<VerifyEmailCache>(`${dto.email}-p`)
  //   console.log(verifyData)
  //   if (!verifyData) {
  //     throw new BadRequestException('Invalid email!')
  //   }
  //   if (verifyData.token !== dto.token) {
  //     throw new BadRequestException('token is not valid')
  //   }
  //   await this.cache.del(`${dto.email}-p`)
  //   const hash = await argon2.hash(dto.newPassword, {
  //     secret: Buffer.from(this.config.get('ARGON2_HASH_PASSWORD') as string)
  //   })
  //   const user = await this.prisma.user.update({
  //     where: { email: dto.email },
  //     data: { hash },
  //     select: { hash: true }
  //   })
  //   console.log(user)
  //   return {
  //     status: HttpStatus.OK,
  //     message: 'Change password successful!'
  //   }
  // }
  // async changePasswordByOldPassword(
  //   id: number,
  //   dto: ChangePasswordByOldPasswordDto
  // ): Promise<RlResponse<AuthResponse<Tokens>>> {
  //   try {
  //     const user = await this.prisma.user.findFirst({
  //       where: { id },
  //       select: {
  //         id: true,
  //         email: true,
  //         hash: true
  //       }
  //     })
  //     if (!user?.hash) {
  //       return {
  //         status: HttpStatus.BAD_REQUEST,
  //         message: 'Old password is incorrect'
  //       }
  //     }
  //     const pwdMatch = await argon2.verify(user?.hash, dto.oldPassword, {
  //       secret: Buffer.from(this.config.get('ARGON2_HASH_PASSWORD') as string)
  //     })
  //     if (!pwdMatch) {
  //       return {
  //         status: HttpStatus.BAD_REQUEST,
  //         message: 'Old password is incorrect'
  //       }
  //     }
  //     const hash = await argon2.hash(dto.newPassword, {
  //       secret: Buffer.from(this.config.get('ARGON2_HASH_PASSWORD') as string)
  //     })
  //     this.prisma.user.update({
  //       where: { id },
  //       data: { hash }
  //     })
  //     return {
  //       status: HttpStatus.OK,
  //       message: 'Change password successful!'
  //     }
  //   } catch (error) {
  //     console.error(error)
  //     throw new BadRequestException('Credentials taken')
  //   }
  // }
  // async signIn(dto: SignInDto): Promise<AuthResponse<Tokens>> {
  //   try {
  //     const user = await this.prisma.user.findFirst({
  //       where: { email: dto.email },
  //       select: {
  //         email: true,
  //         hash: true,
  //         id: true,
  //         verify: {
  //           select: { verified: true }
  //         }
  //       }
  //     })
  //     if (!user?.hash) {
  //       return {
  //         status: 'failed',
  //         user: null,
  //         statusCode: 401,
  //         message: 'email or password is incorrect',
  //         error: 'sign in fail'
  //       }
  //     }
  //     const pwdMatch = await argon2.verify(user.hash, dto.password, {
  //       secret: Buffer.from(this.config.get('ARGON2_HASH_PASSWORD') as string)
  //     })
  //     if (!pwdMatch) {
  //       return {
  //         status: 'failed',
  //         user: null,
  //         statusCode: 401,
  //         message: 'email or password is incorrect',
  //         error: 'sign in fail'
  //       }
  //     }
  //     return this.signInUser(user.id, user.email, user.verify?.verified)
  //   } catch (error) {
  //     console.error(error)
  //     throw new ForbiddenException('Credentials taken')
  //   }
  // }
  // async linkGoogleAccount(id: number, googleId: string) {
  //   const user = await this.prisma.user.findUnique({
  //     where: { id },
  //     select: { googleId: true }
  //   })
  //   if (!user) {
  //     throw new Error('User not found.')
  //   }
  //   if (user.googleId) {
  //     throw new Error('Google account is already linked.')
  //   }
  //   await this.prisma.user.update({
  //     where: { id },
  //     data: { googleId }
  //   })
  // }
  // async unlinkGoogleAccount(id: number) {
  //   const user = await this.prisma.user.findUnique({
  //     where: { id },
  //     select: { googleId: true }
  //   })
  //   if (!user) {
  //     throw new Error('User not found.')
  //   }
  //   if (!user.googleId) {
  //     throw new Error('Google account is not linked.')
  //   }
  //   await this.prisma.user.update({
  //     where: { id },
  //     data: { googleId: null }
  //   })
  // }
  // async signOut(userId: number) {
  //   try {
  //     await this.prisma.verify.update({
  //       where: { userId, hashRt: { not: null } },
  //       data: { hashRt: null }
  //     })
  //     return true
  //   } catch (error) {
  //     console.log(error)
  //     throw new ForbiddenException('Credentials taken')
  //   }
  // }
  // async verifyRt(id?: string | null, refreshToken?: string | null) {
  //   if (!refreshToken || !id) throw new ForbiddenException('Access Denied')
  //   const user = await this.prisma.user.findUnique({
  //     where: { id },
  //     select: {
  //       id: true,
  //       email: true,
  //       verify: {
  //         select: { hashRt: true }
  //       }
  //     }
  //   })
  //   if (!user?.verify?.hashRt) throw new ForbiddenException('Access Denied')
  //   const rtMatched = await argon2.verify(user.verify.hashRt, refreshToken, {
  //     secret: Buffer.from(this.config.get('ARGON2_HASH_RT') as string)
  //   })
  //   if (!rtMatched) throw new ForbiddenException('Token invalid!')
  //   const [accessToken] = await this.getToken({ sub: id, email: user.email })
  //   return accessToken
  // }
  // async signInAuth20(profile: Profile): Promise<AuthResponse<Tokens>> {
  //   try {
  //     let user = await this.prisma.user.findUnique({
  //       where: { email: profile.emails?.[0].value },
  //       select: { id: true, email: true }
  //     })
  //     if (!user?.id) {
  //       user = await this.prisma.user.create({
  //         data: {
  //           email: profile.emails?.[0].value as string,
  //           googleId: profile.id,
  //           provider: EAccountProvider.Email,
  //           profile: {
  //             create: {
  //               photoUrl: profile.photos?.[0].value,
  //               displayName: profile.displayName
  //             }
  //           },
  //           verify: {
  //             create: {
  //               verified: true
  //             }
  //           }
  //         },
  //         select: { id: true, email: true }
  //       })
  //     }
  //     return this.signInUser(user.id, user.email)
  //   } catch (error) {
  //     console.log(error)
  //     throw new ForbiddenException('Credentials taken')
  //   }
  // }
  // private hashVerifyEmail(hash = false) {
  //   const token = randomString(200)
  //   if (!hash) {
  //     return token
  //   }
  //   const secret = Buffer.from(this.config.get('ARGON2_HASH_EMAIL_TOKEN') as string)
  //   return argon2.hash(token, { secret })
  // }
  // private tooManyRequestException() {
  //   return new HttpException(
  //     `email was sent more than 5 times. Try again after ${EMAIL_LINK_EXP} hours`,
  //     HttpStatus.TOO_MANY_REQUESTS
  //   )
  // }
  // private async signInUser(
  //   id: number,
  //   email: string,
  //   verified = true
  // ): Promise<AuthResponse<Tokens>> {
  //   const [accessToken, refreshToken] = await this.getToken({ sub: id, email }, verified)
  //   if (refreshToken) {
  //     await this.prisma.verify.update({
  //       where: { userId: id },
  //       data: {
  //         hashRt: await argon2.hash(refreshToken, {
  //           secret: Buffer.from(this.config.get('ARGON2_HASH_RT') as string)
  //         })
  //       }
  //     })
  //   }
  //   return {
  //     status: 'success',
  //     statusCode: 200,
  //     message: 'sign in successful!',
  //     error: null,
  //     user: { id, email, accessToken, refreshToken }
  //   }
  // }
  // private getToken(payload: any): Promise<[string]>
  // private getToken(payload: any, refresh: boolean): Promise<[string, string]>
  // private getToken(payload: any, refresh?: boolean) {
  //   if (refresh) {
  //     return Promise.all([
  //       this.jwt.signAsync(payload, {
  //         expiresIn: this.config.get<string>('JWT_ACCESS_EXP'),
  //         secret: this.config.get<string>('JWT_ACCESS_SECRET')
  //       }),
  //       this.jwt.signAsync(payload, {
  //         expiresIn: this.config.get<string>('JWT_REFRESH_EXP'),
  //         secret: this.config.get<string>('JWT_REFRESH_SECRET')
  //       })
  //     ])
  //   }
  //   return Promise.all([
  //     this.jwt.signAsync(payload, {
  //       secret: this.config.get<string>('JWT_ACCESS_SECRET'),
  //       expiresIn: this.config.get<string>('JWT_ACCESS_EXP')
  //     })
  //   ])
  // }
  // async hasLoggedInFromOtherDevices(userId: number, currentDeviceId: string) {
  //   const otherDeviceLogins = await this.prisma.userDevice.findMany({
  //     where: {
  //       userId,
  //       deviceId: currentDeviceId
  //     }
  //   })
  //   return otherDeviceLogins.length > 0
  // }
}
