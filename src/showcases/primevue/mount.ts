import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import Aura from '@primeuix/themes/aura'
import zhCN from 'primelocale/zh-CN.json'
import 'primeicons/primeicons.css'
import { createVueShowcase } from '@/showcases/vue-island/createVueShowcase'
import PrimeVueShowcase from './PrimeVueShowcase.vue'

export const mountPrimeVueShowcase = createVueShowcase({
  createRoot: () => PrimeVueShowcase,
  configureApp: (app) => {
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
  },
})
