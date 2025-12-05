import { Component, inject } from '@angular/core'
import { RouterModule } from '@angular/router'
import { APP_CONFIG } from '@remlore/ids-fe/core/app-config'

@Component({
  standalone: true,
  imports: [RouterModule],
  selector: 'rl-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.less'
})
export class AppComponent {
  title = 'rem-ids-fe'
  env = inject(APP_CONFIG).idsUrl
}
