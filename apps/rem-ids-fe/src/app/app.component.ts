import { Component, inject, OnInit } from '@angular/core'
import { RouterModule } from '@angular/router'
import { APP_CONFIG } from '@remlore/ids-fe/core/app-config'
import { IconRegistryService } from '@remlore/ids-fe/core/services'
import { FooterComponent, HeaderComponent, LayoutComponent } from '@remlore/ids-fe/shell/ui'

@Component({
  standalone: true,
  imports: [RouterModule, LayoutComponent, HeaderComponent, FooterComponent],
  selector: 'rl-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'rem-ids-fe'
  env = inject(APP_CONFIG).idsUrl
  iconRegistryService = inject(IconRegistryService)

  ngOnInit() {
    this.iconRegistryService.registerIcons()
  }
}
