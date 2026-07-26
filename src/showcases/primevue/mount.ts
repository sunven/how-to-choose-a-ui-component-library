import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import Aura from '@primeuix/themes/aura'
import zhCN from 'primelocale/zh-CN.json'
import 'primeicons/primeicons.css'
import type { DisposeVueShowcase } from '@/showcases/vue-island/VueIslandHost'
import PrimeVueShowcase from './PrimeVueShowcase.vue'

export function mountPrimeVueShowcase(el: HTMLElement): DisposeVueShowcase {
  const app = createApp(PrimeVueShowcase)
  app.use(PrimeVue, {
    theme: {
      preset: Aura,
      options: {
        // Follow html.dark from Theme Mode (PrimeVue official darkModeSelector)
        darkModeSelector: 'html.dark',
      },
    },
    locale: zhCN['zh-CN'],
  })
  app.use(ToastService)
  app.use(ConfirmationService)
  app.mount(el)
  return () => app.unmount()
}
