import { Component } from '@angular/core'
import { NgtCanvas } from 'angular-three'
import { SceneGraphComponent } from './scene-graph.component'

@Component({
  standalone: true,
  imports: [NgtCanvas],
  selector: 'rl-root',
  templateUrl: './app.component.html',
  styles: [
    `
      :host {
        display: block;
        height: 100dvh;
      }
    `
  ]
})
export class AppComponent {
  title = 'rem-game'
  protected sceneGraph = SceneGraphComponent
}
