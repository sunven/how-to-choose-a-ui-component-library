import { createApp } from 'vue'
import type { DisposeVueShowcase } from '@/showcases/vue-island/VueIslandHost'
import ShadcnVueShowcase from './ShadcnVueShowcase.vue'

export function mountShadcnVueShowcase(el: HTMLElement): DisposeVueShowcase {
  const app = createApp(ShadcnVueShowcase)
  app.mount(el)
  return () => app.unmount()
}
