import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { LoginRequest, LoginResponse, RegisterRequest } from '@remlore/ids-fe/auth/utils'
import { APP_CONFIG } from '@remlore/ids-fe/core/app-config'
import { LocalStorageService } from '@remlore/ids-fe/core/services'
import { RlResponse } from '@remlore/shared/util/types'
import { v4 as uuidv4 } from 'uuid'

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient)
  private readonly appConfig = inject(APP_CONFIG)
  private readonly localStorageService = inject(LocalStorageService)

  login(credentials: LoginRequest, uid: string) {
    return this.http.post<RlResponse<LoginResponse>>(
      `${this.appConfig.idsUrl}/interaction/${uid}/login`,
      credentials,
      {
        withCredentials: true
      }
    )
  }

  register(credentials: RegisterRequest) {
    const deviceId = this.getOrCreateDeviceId()

    return this.http.post<RlResponse<boolean>>(
      `${this.appConfig.idsUrl}/auth/sign-up`,
      { ...credentials, deviceId },
      { withCredentials: true }
    )
  }

  confirmEmail(token: string) {
    return this.http.post<RlResponse<boolean>>(
      `${this.appConfig.idsUrl}/auth/verify-sign-up-email`,
      { token },
      { withCredentials: true }
    )
  }

  private getOrCreateDeviceId() {
    let deviceId = this.localStorageService.get<string>('deviceId')

    if (!deviceId) {
      deviceId = uuidv4()

      this.localStorageService.set('deviceId', deviceId)
    }

    return deviceId
  }
}
