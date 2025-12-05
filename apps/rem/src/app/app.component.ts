import { Component } from '@angular/core'
import { LayoutComponent } from '@remlore/web/shell/feature'

@Component({
  selector: 'rl-root',
  template: `<rl-layout></rl-layout>`,
  imports: [LayoutComponent]
})
export class AppComponent {}
