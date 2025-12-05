import { PreloadingStrategy, Route } from '@angular/router'
import { Observable, of } from 'rxjs'

export class SelectRoutePreloadStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    return route.data && route.data['preload'] ? load() : of(null)
  }
}
