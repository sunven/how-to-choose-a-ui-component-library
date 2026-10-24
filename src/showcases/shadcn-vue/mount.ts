import { createVueShowcase } from '@/showcases/vue-island/createVueShowcase'
import ShadcnVueShowcase from './ShadcnVueShowcase.vue'

export const mountShadcnVueShowcase = createVueShowcase({
  createRoot: () => ShadcnVueShowcase,
})
