import { CommonModule, JsonPipe } from '@angular/common'
import { Component, inject, OnInit } from '@angular/core'
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { AuthService } from '@remlore/ids-fe/auth/data-access'
import { APP_CONFIG } from '@remlore/ids-fe/core/app-config'
import { Maybe } from '@remlore/shared/util/types'

@Component({
  selector: 'rl-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, JsonPipe],
  templateUrl: './login.component.html',
  styleUrl: './login.component.less',
  providers: [AuthService]
})
export class LoginComponent implements OnInit {
  private readonly loginService = inject(AuthService)
  private readonly activatedRoute = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly appConfig = inject(APP_CONFIG)
  loginForm = new FormGroup({
    email: new FormControl<Maybe<string>>(null),
    password: new FormControl<Maybe<string>>(null)
  })
  uid!: string
  idsUrl = this.appConfig.idsUrl

  ngOnInit() {
    this.uid = this.activatedRoute.snapshot.paramMap.get('uid') as string
  }

  onSubmit() {
    const uid = this.activatedRoute.snapshot.params['uid']
    return this.loginService
      .login(
        {
          email: this.loginForm.value.email!,
          password: this.loginForm.value.password!
        },
        uid
      )
      .subscribe((res) => {
        console.log(res, '=======login=====')
        if (res.status === 200) {
          this.router.navigate(['/auth/consent', this.uid])
        }
      })
  }
}
