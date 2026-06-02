import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatChipsModule } from '@angular/material/chips'
import { MatIconModule } from '@angular/material/icon'
import { MatTableModule } from '@angular/material/table'

interface Device {
  id: string
  name: string
  type: string
  location: string
  lastActive: Date
  current: boolean
}

@Component({
  selector: 'rl-devices',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTableModule
  ],
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.scss']
})
export class DevicesComponent {
  devices: Device[] = [
    {
      id: '1',
      name: 'Chrome on Windows',
      type: 'desktop',
      location: 'New York, USA',
      lastActive: new Date(),
      current: true
    },
    {
      id: '2',
      name: 'Safari on iPhone',
      type: 'mobile',
      location: 'New York, USA',
      lastActive: new Date(Date.now() - 3600000),
      current: false
    },
    {
      id: '3',
      name: 'Firefox on MacBook',
      type: 'desktop',
      location: 'San Francisco, USA',
      lastActive: new Date(Date.now() - 86400000),
      current: false
    }
  ]

  getDeviceIcon(type: string): string {
    switch (type) {
      case 'mobile':
        return 'phone_iphone'
      case 'tablet':
        return 'tablet'
      default:
        return 'computer'
    }
  }

  revokeSession(deviceId: string) {
    console.log('Revoking session:', deviceId)
    // API call to revoke session
  }

  revokeAllSessions() {
    console.log('Revoking all sessions except current')
    // API call to revoke all sessions
  }
}
