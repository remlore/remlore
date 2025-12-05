import { CommonModule } from '@angular/common'
import { Component, Inject, OnInit } from '@angular/core'
import { APP_CONFIG, AppConfig } from '@remlore/web/core/app-config'
import { OidcSecurityService } from 'angular-auth-oidc-client'

@Component({
  selector: 'rl-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.less'
})
export class HeaderComponent implements OnInit {
  isAuthenticated = false
  user: any = null

  constructor(
    private readonly oidcService: OidcSecurityService,
    @Inject(APP_CONFIG) private readonly apiConfig: AppConfig
  ) {}

  ngOnInit() {
    // console.log(this.apiConfig)
    this.oidcService.checkAuth().subscribe(({ isAuthenticated, userData }) => {
      this.isAuthenticated = isAuthenticated
      this.user = userData
      console.log('user data: ', userData)
    })
  }

  login() {
    this.oidcService.authorize()
  }

  logout() {
    this.oidcService.logoff().subscribe((result) => console.log(result))
  }

  getToken() {
    this.oidcService.getAccessToken().subscribe((token) => {
      console.log(token)
    })
  }
}
