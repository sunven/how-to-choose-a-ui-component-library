import './rekaDocsSkin.css'
import { createVueShowcase } from '@/showcases/vue-island/createVueShowcase'
import RekaUiShowcase from './RekaUiShowcase.vue'

export const mountRekaUiShowcase = createVueShowcase({
  createRoot: () => RekaUiShowcase,
})
