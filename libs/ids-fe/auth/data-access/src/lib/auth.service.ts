import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { APP_CONFIG } from '@remlore/ids-fe/core/app-config'
import { ILoginDto } from '@remlore/shared/dto'

@Injectable()
export class AuthService {
  private readonly http = inject(HttpClient)
  private readonly appConfig = inject(APP_CONFIG)

  login(dto: ILoginDto, uid: string) {
    return this.http.post<any>(`${this.appConfig.idsUrl}/interaction/${uid}/login`, dto, {
      withCredentials: true
    })
  }

  consentDetails(uid: string) {
    return this.http.get<any>(`${this.appConfig.idsUrl}/interaction/${uid}/consent`, {
      withCredentials: true
    })
  }

  confirm(uid: string) {
    return this.http.post<any>(`${this.appConfig.idsUrl}/interaction/${uid}/consent`, null, {
      withCredentials: true
    })
  }
}
