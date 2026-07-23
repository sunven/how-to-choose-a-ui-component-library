import { createApp, type App } from 'vue'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import Aura from '@primeuix/themes/aura'
import zhCN from 'primelocale/zh-CN.json'
import 'primeicons/primeicons.css'
import PrimeVueShowcase from './PrimeVueShowcase.vue'

export function mountPrimeVueShowcase(el: HTMLElement): App {
  const app = createApp(PrimeVueShowcase)
  app.use(PrimeVue, {
    theme: {
      preset: Aura,
      options: {
        darkModeSelector: false,
      },
    },
    locale: zhCN['zh-CN'],
  })
  app.use(ToastService)
  app.use(ConfirmationService)
  app.mount(el)
  return app
}
