import { bootstrapApplication } from '@angular/platform-browser'

import { AppComponent } from './app/app.component'
import { appConfig } from './app/app.config'

const remImgStyle = [
  'background-image: url(libs/web/shared/assets/src/images/Rem_sleep.jpg)',
  'background-size: cover',
  'color: black',
  'padding: 100px',
  'font-weight: bolder',
  'font-size: 40px',
  '-webkit-text-stroke-width: 1px',
  '-webkit-text-stroke-color: yellow',
  'text-transform: uppercase',
  'text-align: center',
  'letter-spacing: 1px'
].join(' ;')

console.log(`%c REM`, remImgStyle)

bootstrapApplication(AppComponent, appConfig)
