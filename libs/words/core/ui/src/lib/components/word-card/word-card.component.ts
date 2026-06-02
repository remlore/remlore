import { CommonModule } from '@angular/common'
import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatIconModule } from '@angular/material/icon'
import { ApiService, SpeechService } from '@remlore/words/core/data-access'
import { Word } from '@remlore/words/core/util'

@Component({
  selector: 'rl-word-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './word-card.component.html',
  styleUrls: ['./word-card.component.scss']
})
export class WordCardComponent {
  @Input() word!: Word
  @Output() swipe = new EventEmitter<'liked' | 'disliked'>()

  showTranslation = false
  translation = ''
  isTranslating = false

  // Swipe animation properties
  startX = 0
  currentX = 0
  isDragging = false
  transform = ''
  opacity = 1

  constructor(
    private el: ElementRef,
    private speechService: SpeechService,
    private apiService: ApiService
  ) {}

  @HostListener('mousedown', ['$event'])
  @HostListener('touchstart', ['$event'])
  onDragStart(event: MouseEvent | TouchEvent) {
    this.isDragging = true
    this.startX = this.getPositionX(event)
  }

  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:touchmove', ['$event'])
  onDragMove(event: MouseEvent | TouchEvent) {
    if (!this.isDragging) return

    this.currentX = this.getPositionX(event)
    const deltaX = this.currentX - this.startX
    const rotation = deltaX * 0.1

    this.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`
    this.opacity = 1 - Math.abs(deltaX) / 300
  }

  @HostListener('document:mouseup')
  @HostListener('document:touchend')
  onDragEnd() {
    if (!this.isDragging) return

    this.isDragging = false
    const deltaX = this.currentX - this.startX

    if (Math.abs(deltaX) > 100) {
      // Swipe threshold reached
      const direction = deltaX > 0 ? 'liked' : 'disliked'
      this.animateOut(direction)
    } else {
      // Reset position
      this.transform = ''
      this.opacity = 1
    }
  }

  private getPositionX(event: MouseEvent | TouchEvent): number {
    return event instanceof MouseEvent ? event.clientX : event.touches[0].clientX
  }

  private animateOut(direction: 'liked' | 'disliked') {
    const moveX = direction === 'liked' ? 1000 : -1000
    this.transform = `translateX(${moveX}px) rotate(${moveX * 0.1}deg)`
    this.opacity = 0

    setTimeout(() => {
      this.swipe.emit(direction)
      this.resetCard()
    }, 300)
  }

  private resetCard() {
    this.transform = ''
    this.opacity = 1
    this.showTranslation = false
    this.translation = ''
  }

  onLike() {
    this.animateOut('liked')
  }

  onDislike() {
    this.animateOut('disliked')
  }

  async toggleTranslation() {
    if (this.showTranslation) {
      this.showTranslation = false
      return
    }

    if (!this.translation) {
      this.isTranslating = true
      this.apiService.translateWord(this.word.word).subscribe({
        next: (result) => {
          this.translation = result.translation
          this.showTranslation = true
          this.isTranslating = false
        },
        error: (err) => {
          console.error('Translation error:', err)
          this.isTranslating = false
        }
      })
    } else {
      this.showTranslation = true
    }
  }

  speakWord() {
    this.speechService.speak(this.word.word)
  }
}
