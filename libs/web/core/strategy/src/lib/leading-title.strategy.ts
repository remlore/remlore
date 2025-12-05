import { ClassProvider, Inject, Injectable } from '@angular/core'
import { Title } from '@angular/platform-browser'
import { ActivatedRouteSnapshot, RouterStateSnapshot, TitleStrategy } from '@angular/router'
import { APP_CONFIG, AppConfig } from '@remlore/web/core/app-config'

export function provideTitle(): ClassProvider {
  return { provide: TitleStrategy, useClass: LeadingTitleStrategy }
}

@Injectable()
export class LeadingTitleStrategy extends TitleStrategy {
  constructor(
    private readonly title: Title,
    @Inject(APP_CONFIG) private readonly appConfig: AppConfig
  ) {
    super()
  }

  override updateTitle(routerState: RouterStateSnapshot): void {
    const title = this.getTitleFromRoute(routerState.root)
    if (title) {
      this.title.setTitle(`${this.appConfig.appName} | ${title}`) // 🔥 Customize format
    } else {
      this.title.setTitle(this.appConfig.appName)
    }
  }

  private getTitleFromRoute(route: ActivatedRouteSnapshot): string | null {
    let title = route.data['title'] || null

    if (route.firstChild) {
      title = this.getTitleFromRoute(route.firstChild) || title
    }

    return title
  }
}
