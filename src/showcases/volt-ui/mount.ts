import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import zhCN from 'primelocale/zh-CN.json'
import './voltTokens.css'
import { createVueShowcase } from '@/showcases/vue-island/createVueShowcase'
import VoltUiShowcase from './VoltUiShowcase.vue'

/** PrimeVue unstyled + copied Volt PT components (official Volt copy-source path). */
export const mountVoltUiShowcase = createVueShowcase({
  createRoot: () => VoltUiShowcase,
  configureApp: (app) => {
    app.use(PrimeVue, {
      unstyled: true,
      locale: zhCN['zh-CN'],
    })
    app.use(ToastService)
    app.use(ConfirmationService)
  },
})
