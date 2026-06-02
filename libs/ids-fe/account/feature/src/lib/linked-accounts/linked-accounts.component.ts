import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatChipsModule } from '@angular/material/chips'
import { MatIconModule } from '@angular/material/icon'

interface LinkedAccount {
  provider: string
  email: string
  linkedDate: Date
  connected: boolean
}

@Component({
  selector: 'rl-linked-accounts',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  templateUrl: './linked-accounts.component.html',
  styleUrls: ['./linked-accounts.component.scss']
})
export class LinkedAccountsComponent {
  accounts: LinkedAccount[] = [
    {
      provider: 'google',
      email: 'john.doe@gmail.com',
      linkedDate: new Date(Date.now() - 30 * 86400000),
      connected: true
    },
    {
      provider: 'facebook',
      email: '',
      linkedDate: new Date(),
      connected: false
    }
  ]

  getProviderName(provider: string): string {
    return provider.charAt(0).toUpperCase() + provider.slice(1)
  }

  connectAccount(provider: string) {
    console.log('Connecting account:', provider)
    // OAuth flow implementation
  }

  disconnectAccount(provider: string) {
    console.log('Disconnecting account:', provider)
    // API call to disconnect
  }
}
