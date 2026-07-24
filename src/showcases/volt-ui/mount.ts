import { createApp, type App } from 'vue'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import zhCN from 'primelocale/zh-CN.json'
import './voltTokens.css'
import VoltUiShowcase from './VoltUiShowcase.vue'

/** PrimeVue unstyled + copied Volt PT components (official Volt copy-source path). */
export function mountVoltUiShowcase(el: HTMLElement): App {
  el.classList.add('volt-island')
  const app = createApp(VoltUiShowcase)
  app.use(PrimeVue, {
    unstyled: true,
    locale: zhCN['zh-CN'],
  })
  app.use(ToastService)
  app.use(ConfirmationService)
  app.mount(el)
  return app
}
