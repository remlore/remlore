import { CommonModule, DOCUMENT } from '@angular/common'
import { Component, inject, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatCardModule } from '@angular/material/card'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatDividerModule } from '@angular/material/divider'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { ActivatedRoute } from '@angular/router'
import { AuthService, InteractionService } from '@remlore/ids-fe/auth/data-access'
import { Client } from '@remlore/ids-fe/auth/utils'
import { switchMap } from 'rxjs'

@Component({
  selector: 'rl-consent',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatListModule,
    MatCheckboxModule,
    FormsModule
  ],
  templateUrl: './consent.component.html',
  styleUrl: './consent.component.scss'
})
export class ConsentComponent implements OnInit {
  private readonly authService = inject(AuthService)
  private readonly interactionService = inject(InteractionService)
  private readonly activatedRoute = inject(ActivatedRoute)
  private document = inject(DOCUMENT)

  uid!: string
  client?: Client
  scopes?: string[]
  scopeMap: Record<string, string> = {
    openid: 'Your account identifier',
    offline_access: 'Keep connected to your account',
    profile: 'Your profile information (name, email, phone, ...)',
    email: 'Your email address',
    'api.read': 'Access data Remlore'
  }

  ngOnInit() {
    this.activatedRoute.paramMap
      .pipe(
        switchMap((paramMap) => {
          this.uid = paramMap.get('uid') ?? ''
          return this.interactionService.getInteraction(this.uid)
        })
      )
      .subscribe((res) => {
        this.scopes = res.interaction?.params?.scope.split(' ')
        this.client = res.interaction?.client
      })
  }

  confirm() {
    return this.interactionService.grantConsent(this.uid, this.scopes!, true).subscribe((res) => {
      console.log(res)
      this.document.location.href = res?.data?.redirectTo ?? '/'
    })
  }

  deny() {
    console.log('Consent denied')
    // API call to deny consent
  }
}
