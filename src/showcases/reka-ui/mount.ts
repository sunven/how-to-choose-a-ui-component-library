import { createApp, type App } from 'vue'
import './rekaDocsSkin.css'
import RekaUiShowcase from './RekaUiShowcase.vue'

export function mountRekaUiShowcase(el: HTMLElement): App {
  el.classList.add('reka-island')
  const app = createApp(RekaUiShowcase)
  app.mount(el)
  return app
}
