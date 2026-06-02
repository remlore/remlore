import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'

@Component({
  selector: 'rl-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  private fb = inject(FormBuilder)
  private snackBar = inject(MatSnackBar)
  profileForm: FormGroup

  constructor() {
    this.profileForm = this.fb.group({
      fullName: ['John Doe', Validators.required],
      email: ['john.doe@example.com', [Validators.required, Validators.email]],
      phone: ['+1234567890'],
      bio: ['']
    })
  }

  onSave() {
    if (this.profileForm.valid) {
      console.log('Profile updated:', this.profileForm.value)
      this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 })
    }
  }

  onCancel() {
    this.profileForm.reset()
  }
}
