import { CommonModule, DOCUMENT } from '@angular/common'
import { Component, Inject, OnInit } from '@angular/core'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { AuthService } from '@remlore/ids-fe/auth/data-access'
import { Maybe } from '@remlore/shared/util/types'
import { switchMap } from 'rxjs'

@Component({
  selector: 'rl-consent',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './consent.component.html',
  styleUrl: './consent.component.less',
  providers: [AuthService]
})
export class ConsentComponent implements OnInit {
  uid!: string
  client: Maybe<string> = null
  scopes: Maybe<string[]> = null
  scopeMap: Record<string, string> = {
    openid: 'Your account identifier',
    offline_access: 'Keep connected to your account',
    profile: 'Your profile information (name, email, phone, ...)',
    email: 'Your email address',
    scopeMap: 'Your email address',
    'api.read': 'Access data Remlore'
  }

  constructor(
    private readonly authService: AuthService,
    private readonly activatedRoute: ActivatedRoute,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit() {
    this.activatedRoute.paramMap
      .pipe(
        switchMap((pm) => {
          this.uid = pm.get('uid') ?? ''
          return this.authService.consentDetails(this.uid)
        })
      )
      .subscribe((res) => {
        this.scopes = res.scopes
        this.client = res.client
      })
  }

  confirm() {
    return this.authService.confirm(this.uid).subscribe((res) => {
      console.log(res)
      this.document.location.href = res?.data?.redirectTo
    })
  }
}
