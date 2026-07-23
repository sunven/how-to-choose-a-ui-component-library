import { createApp, type App } from 'vue'
import 'flowbite-vue/index.css'
import FlowbiteVueShowcase from './FlowbiteVueShowcase.vue'

export function mountFlowbiteVueShowcase(el: HTMLElement): App {
  const app = createApp(FlowbiteVueShowcase)
  app.mount(el)
  return app
}
