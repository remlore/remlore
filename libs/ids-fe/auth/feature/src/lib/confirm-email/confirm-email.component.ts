import { CommonModule } from '@angular/common'
import { Component, inject, OnInit } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { ActivatedRoute, RouterModule } from '@angular/router'
import { AuthService } from '@remlore/ids-fe/auth/data-access'

@Component({
  selector: 'rl-confirm-email',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './confirm-email.component.html',
  styleUrls: ['./confirm-email.component.scss']
})
export class ConfirmEmailComponent implements OnInit {
  private route = inject(ActivatedRoute)
  private authService = inject(AuthService)
  loading = true
  success = false
  errorMessage = 'The confirmation link is invalid or has expired.'
  token: string | null = null

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token')
    if (this.token) {
      this.confirmEmail()
    } else {
      this.loading = false
      this.success = false
    }
  }

  confirmEmail() {
    // API call to confirm email
    this.authService.confirmEmail(this.token!).subscribe({
      next: () => {
        this.loading = false
        this.success = true
      },
      error: (err) => {
        this.loading = false
        this.success = false
        if (err.error && err.error.message) {
          this.errorMessage = err.error.message
        }
      }
    })
  }

  resendConfirmation() {
    console.log('Resending confirmation email')
    this.authService.confirmEmail(this.token!)
  }
}
