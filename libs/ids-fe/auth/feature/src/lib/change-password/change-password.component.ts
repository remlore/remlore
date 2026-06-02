import { CommonModule } from '@angular/common'
import { Component, inject, OnInit } from '@angular/core'
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { ActivatedRoute, RouterModule } from '@angular/router'

@Component({
  selector: 'rl-change-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule
  ],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  private fb = inject(FormBuilder)
  private route = inject(ActivatedRoute)
  requestForm: FormGroup
  resetForm: FormGroup
  hidePassword = true
  hideConfirmPassword = true
  loading = false
  emailSent = false
  hasToken = false
  token: string | null = null

  constructor() {
    this.requestForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    })

    this.resetForm = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required]
      },
      { validators: this.passwordMatchValidator }
    )
  }

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token')
    this.hasToken = !!this.token
  }

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password')
    const confirmPassword = control.get('confirmPassword')

    if (!password || !confirmPassword) return null

    if (confirmPassword.value && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true })
      return { passwordMismatch: true }
    }
    return null
  }

  onRequestReset() {
    if (this.requestForm.valid) {
      this.loading = true
      // API call to request password reset
      setTimeout(() => {
        this.loading = false
        this.emailSent = true
      }, 2000)
    }
  }

  onResetPassword() {
    if (this.resetForm.valid) {
      this.loading = true
      // API call to reset password with token
      console.log('Reset password with token:', this.token)
    }
  }
}
