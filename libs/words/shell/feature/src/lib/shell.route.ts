import { Routes } from '@angular/router'
import { HomeComponent } from '@remlore/words/home/feature'

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: '**', redirectTo: '' }
]
