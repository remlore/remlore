import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { OidcSecurityService } from 'angular-auth-oidc-client'

@Component({
  selector: 'rl-callback',
  imports: [CommonModule, RouterLink],
  templateUrl: './callback.component.html',
  styleUrl: './callback.component.less'
})
export class CallbackComponent implements OnInit {
  constructor(
    private readonly oidcService: OidcSecurityService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit() {
    // try {
    //   // Handle authentication response and get tokens
    //   this.oidcService.checkAuth().subscribe(({ isAuthenticated, userData }) => {
    //     console.log('checkAuth===========', userData)
    //     if (isAuthenticated) {
    //       console.log('User logged in')
    //       // Redirect to home page or previous page
    //       // const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/'
    //       // this.router.navigateByUrl(returnUrl)
    //     } else {
    //       console.error('Login failed')
    //     }
    //   }) // Process login response
    // } catch (error) {
    //   console.error('Error handling callback:', error)
    //   // this.router.navigate(['/auth/login']) // Redirect back to login if error
    // }
  }
}
