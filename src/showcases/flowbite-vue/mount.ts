import 'flowbite-vue/index.css'
import { createVueShowcase } from '@/showcases/vue-island/createVueShowcase'
import FlowbiteVueShowcase from './FlowbiteVueShowcase.vue'

export const mountFlowbiteVueShowcase = createVueShowcase({
  createRoot: () => FlowbiteVueShowcase,
})
