import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { GrantConsentResponse, InteractionDetails } from '@remlore/ids-fe/auth/utils'
import { APP_CONFIG } from '@remlore/ids-fe/core/app-config'
import { RlResponse } from '@remlore/shared/util/types'

@Injectable({
  providedIn: 'root'
})
export class InteractionService {
  private readonly http = inject(HttpClient)
  private readonly appConfig = inject(APP_CONFIG)

  getInteraction(uid: string) {
    return this.http.get<RlResponse<InteractionDetails, 'interaction'>>(
      `${this.appConfig.idsUrl}/interaction/${uid}`,
      {
        withCredentials: true
      }
    )
  }

  login(uid: string, email: string, password: string, remember: boolean) {
    return this.http.post(
      `${this.appConfig.idsUrl}/interaction/${uid}/login`,
      { email, password, remember },
      { withCredentials: true } // CRITICAL: Include cookies
    )
  }

  verifyMfa(uid: string, tempToken: string, code: string) {
    return this.http.post(
      `${this.appConfig.idsUrl}/interaction/${uid}/mfa/verify`,
      { tempToken, code },
      { withCredentials: true }
    )
  }

  grantConsent(uid: string, grantedScopes: string[], rememberConsent: boolean) {
    return this.http.post<RlResponse<GrantConsentResponse>>(
      `${this.appConfig.idsUrl}/interaction/${uid}/consent`,
      { grantedScopes, rememberConsent },
      { withCredentials: true }
    )
  }

  abortInteraction(uid: string) {
    return this.http.post(
      `${this.appConfig.idsUrl}/interaction/${uid}/abort`,
      {},
      { withCredentials: true }
    )
  }
}
