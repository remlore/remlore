import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Word } from '@remlore/words/core/util'
import { Observable } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000'
  private userId = 'user123' // Replace with actual user ID from your auth

  constructor(private http: HttpClient) {}

  private getHeaders() {
    return new HttpHeaders({ 'user-id': this.userId })
  }

  getDailyWords(): Observable<Word[]> {
    return this.http.get<Word[]>(`${this.baseUrl}/words/daily`, {
      headers: this.getHeaders()
    })
  }

  updateWordStatus(wordId: string, status: 'liked' | 'disliked'): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/user-words/status`,
      { wordId, status },
      { headers: this.getHeaders() }
    )
  }

  addToLibrary(wordId: string, libraryName: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/user-words/library`,
      { wordId, libraryName },
      { headers: this.getHeaders() }
    )
  }

  getUserLibraries(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/user-words/libraries`, {
      headers: this.getHeaders()
    })
  }

  getLibraryWords(libraryName: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/user-words/libraries/${libraryName}`, {
      headers: this.getHeaders()
    })
  }

  translateWord(text: string): Observable<{ translation: string }> {
    return this.http.post<{ translation: string }>(`${this.baseUrl}/ai/translate`, { text })
  }

  getSettings(): Observable<any> {
    return this.http.get(`${this.baseUrl}/user-words/settings`, {
      headers: this.getHeaders()
    })
  }

  updateSettings(dailyWordLimit: number): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/user-words/settings`,
      { dailyWordLimit },
      { headers: this.getHeaders() }
    )
  }
}
