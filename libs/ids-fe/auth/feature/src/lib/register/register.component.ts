import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatDividerModule } from '@angular/material/divider'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar } from '@angular/material/snack-bar'
import { RouterModule } from '@angular/router'
import { AuthService } from '@remlore/ids-fe/auth/data-access'

@Component({
  selector: 'rl-register',
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
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder)
  private readonly authService = inject(AuthService)
  private _snackBar = inject(MatSnackBar)

  registerForm: FormGroup
  hidePassword = true
  hideConfirmPassword = true
  loading = false

  constructor() {
    this.registerForm = this.fb.group(
      {
        displayName: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
        agreeToTerms: [false, Validators.requiredTrue]
      },
      { validators: this.passwordMatchValidator }
    )
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

  onSubmit() {
    if (this.registerForm.valid) {
      this.authService
        .register({
          displayName: this.registerForm.value.displayName,
          email: this.registerForm.value.email,
          password: this.registerForm.value.password
        })
        .subscribe((res) => {
          if (res.success) {
            this._snackBar.open(
              res.message ||
                'Registration successful! Please check your email to confirm your account.',
              'Close'
            )
          } else {
            this._snackBar.open(res.message || 'Registration failed. Please try again.', 'Close')
          }
        })
      this.loading = true
      // API call implementation goes here
      console.log('Register form submitted:', this.registerForm.value)

      setTimeout(() => {
        this.loading = false
      }, 1000)
    }
  }
}
