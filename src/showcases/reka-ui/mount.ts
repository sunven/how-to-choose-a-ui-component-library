import { createApp } from 'vue'
import './rekaDocsSkin.css'
import type { DisposeVueShowcase } from '@/showcases/vue-island/VueIslandHost'
import RekaUiShowcase from './RekaUiShowcase.vue'

export function mountRekaUiShowcase(el: HTMLElement): DisposeVueShowcase {
  const app = createApp(RekaUiShowcase)
  app.mount(el)
  return () => app.unmount()
}
