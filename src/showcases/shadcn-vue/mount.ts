import { createApp, type App } from 'vue'
import ShadcnVueShowcase from './ShadcnVueShowcase.vue'

export function mountShadcnVueShowcase(el: HTMLElement): App {
  const app = createApp(ShadcnVueShowcase)
  app.mount(el)
  return app
}
