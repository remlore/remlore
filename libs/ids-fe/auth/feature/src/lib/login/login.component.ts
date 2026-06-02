import { CommonModule, isPlatformBrowser } from '@angular/common'
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatDividerModule } from '@angular/material/divider'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { AuthService, InteractionService } from '@remlore/ids-fe/auth/data-access'
import { LoginContext } from '@remlore/ids-fe/auth/utils'
import { APP_CONFIG } from '@remlore/ids-fe/core/app-config'

@Component({
  selector: 'rl-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  private readonly authService = inject(AuthService)
  private readonly interactionService = inject(InteractionService)
  private readonly activatedRoute = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly appConfig = inject(APP_CONFIG)
  private readonly fb = inject(FormBuilder)
  public readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID))

  context: LoginContext = { type: 'oauth' }

  loginForm: FormGroup
  hidePassword = true
  loading = false
  uid?: string

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    })
  }

  ngOnInit() {
    this.determineContext()
  }

  onSubmit() {
    const uid = this.activatedRoute.snapshot.params['uid']

    this.authService
      .login(
        {
          email: this.loginForm.value.email,
          password: this.loginForm.value.password
        },
        uid
      )
      .subscribe((res) => {
        console.log(res, '=======login=====')
        if (res.success) {
          this.router.navigate(['/auth/consent', this.uid])
        }
      })
  }

  private determineContext() {
    const uid = this.activatedRoute.snapshot.queryParamMap.get('uid')
    console.log(uid)

    if (uid) {
      this.context.type = 'oauth'
      this.context.uid = uid

      this.interactionService.getInteraction(uid).subscribe((res) => {
        if (res) {
          this.context.interaction = res.interaction
          this.context.clientInfo = res.interaction.client
          this.context.redirectUri = res.interaction.params.redirectUri
        }
      })
    }
  }
}
