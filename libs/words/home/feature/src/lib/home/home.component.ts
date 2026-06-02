import { CommonModule } from '@angular/common'
import { Component, inject, OnInit } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { MatToolbarModule } from '@angular/material/toolbar'
import { ApiService } from '@remlore/words/core/data-access'
import { WordCardComponent } from '@remlore/words/core/ui'
import { Word } from '@remlore/words/core/util'

@Component({
  selector: 'rl-home',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    WordCardComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private readonly apiService = inject(ApiService)
  private readonly snackBar = inject(MatSnackBar)

  words: Word[] = []
  currentIndex = 0
  isLoading = true

  ngOnInit() {
    this.loadWords()
  }

  loadWords() {
    this.isLoading = true
    this.apiService.getDailyWords().subscribe({
      next: (words) => {
        this.words = words
        this.isLoading = false
      },
      error: (err) => {
        console.error('Error loading words:', err)
        this.snackBar.open('Không thể tải từ vựng', 'Đóng', { duration: 3000 })
        this.isLoading = false
      }
    })
  }

  onSwipe(direction: 'liked' | 'disliked') {
    const currentWord = this.words[this.currentIndex]

    this.apiService.updateWordStatus(currentWord._id, direction).subscribe({
      next: () => {
        const message = direction === 'liked' ? 'Đã thích từ này!' : 'Đã bỏ qua từ này!'
        this.snackBar.open(message, '', { duration: 1500 })

        this.currentIndex++

        if (this.currentIndex >= this.words.length) {
          this.snackBar.open('Đã hoàn thành từ vựng hôm nay! 🎉', 'Đóng', { duration: 3000 })
        }
      },
      error: (err) => {
        console.error('Error updating word status:', err)
      }
    })
  }

  get currentWord(): Word | null {
    return this.words[this.currentIndex] || null
  }
  get progress(): number {
    return this.words.length > 0 ? (this.currentIndex / this.words.length) * 100 : 0
  }
}
