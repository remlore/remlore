import { OidcSecurityService } from 'angular-auth-oidc-client'

// @Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private readonly oidcService: OidcSecurityService) {}

  async handleCallback(): Promise<void> {
    this.oidcService.checkAuth().subscribe((auth) => {
      console.log('checkAuth', auth)
    }) // Process login response

    if (this.oidcService.isAuthenticated()) {
      console.log('User logged in')
    } else {
      console.error('Login failed')
    }
  }

  // get accessToken(): string | null {
  //   this.oidcService.getAccessToken().subscribe((accessToken) => console.log(accessToken))
  // }

  // get isLoggedIn(): boolean {
  //   return this.oidcService.isAuthenticated()
  // }

  logout(): void {
    this.oidcService.logoff()
  }
}
