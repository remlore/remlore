import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  set<T>(key: string, data: T) {
    localStorage.setItem(key, JSON.stringify(data))
  }

  get<T>(key: string): T | null {
    const data = localStorage.getItem(key) as string

    try {
      return JSON.parse(data)
    } catch {
      return null
    }
  }
}
