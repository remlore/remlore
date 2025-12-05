import { CommonModule } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { Component, ViewEncapsulation } from '@angular/core'

@Component({
  selector: 'rl-nx-welcome',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="wrapper">
      <div class="container">
        <div id="welcome">
          <h1>
            <span> Hello there, </span>
            Welcome Mo viii
          </h1>
          <button mat-button (click)="getMe()">test</button>
        </div>
      </div>
    </div>
  `,
  styles: [],
  encapsulation: ViewEncapsulation.None
})
export class NxWelcomeComponent {
  constructor(private readonly http: HttpClient) {}

  getMe() {
    this.http
      .get('https://localhost:5000/api/v1/user/me', {
        withCredentials: true,
        headers: {
          Authorization:
            'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6ImF0K2p3dCIsImtpZCI6ImYyNjJhMzIxNDIxM2QxOTRjOTI5OTFkNjczNWIxNTNiIn0.eyJqdGkiOiJYb2c5bThrOWRRM2loSlhfeGd6R1EiLCJzdWIiOiJiYThlZmZhZC1jODBmLTQ4OWYtYjc3MC00OWYyZDg2YzI2ZTUiLCJpYXQiOjE3NDU2ODMyMzksImV4cCI6MTc0NTY4NjgzOSwic2NvcGUiOiJhcGkucmVhZCBhcGkud3JpdGUiLCJjbGllbnRfaWQiOiJyZW1sb3JlIiwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMSIsImF1ZCI6Imh0dHBzOi8vbG9jYWxob3N0OjUwMDAifQ.mEnlJRu72gSqAmU3X6HZHbpPYvA6HQiqEskb34LCKezaAFPkrfZthPfORDRaEUIOcXBbIYNsNJ1L98aZlF69ASPZHkpk2_CN1G9pEyjDedq9M4X-q_Yvgdhw3AXPPl5jULJOWXjUR085MALxstj9aByBOxdCR4Io3IYd8rVJrX0jV6qLvEE7THohDgwZxi4l5iIQq_4FO1Sc5pfYKz4CbDjPSROCyHIem3wT6SWTgXILlxxy54yAssvtz-OppbiqqgTgbWXNUSwv47bE6ERebpQE_s173TYmOZzITWw7-ORdu2OYu1y0ccYbqtHODVJsUZULNLiM9eDfQf8zquzm0B_rNJ-ylU6C_1HEVFtywaR2--UmTqAs3UfmF3GltOlFI5u7L90V6s9Rozb0Qcye6-ejw_LU6ec8F_oX-r_fK9qqQ8g-s8TMgnt4k3gV9mX8WyM_grHt5VWFoiWNZot-jseKMMeyEGTrBgPAagTXslpXBIlxZLg0PNb2iXWvCJ5R'
        }
      })
      .subscribe(console.log)
  }
}
