import { createApp } from 'vue'
import 'flowbite-vue/index.css'
import type { DisposeVueShowcase } from '@/showcases/vue-island/VueIslandHost'
import FlowbiteVueShowcase from './FlowbiteVueShowcase.vue'

export function mountFlowbiteVueShowcase(el: HTMLElement): DisposeVueShowcase {
  const app = createApp(FlowbiteVueShowcase)
  app.mount(el)
  return () => app.unmount()
}
