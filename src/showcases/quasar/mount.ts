import {
  Quasar,
  Dark,
  Notify,
  Dialog,
  QBtn,
  QCard,
  QCardActions,
  QCardSection,
  QDialog,
  QInput,
  QSelect,
  QTable,
  QTd,
  QToggle,
  QBadge,
} from 'quasar'
import quasarLang from 'quasar/lang/zh-CN'
import quasarIconSet from 'quasar/icon-set/material-icons'
import 'quasar/dist/quasar.css'
// @quasar/extras package exports only JS entry for material-icons; CSS lives under exports/
import '@quasar/extras/material-icons/material-icons.css'
import { createVueShowcase } from '@/showcases/vue-island/createVueShowcase'
import QuasarShowcase from './QuasarShowcase.vue'

export const mountQuasarShowcase = createVueShowcase({
  createRoot: () => QuasarShowcase,
  configureApp: (app, mode) => {
    app.use(Quasar, {
      plugins: { Dark, Notify, Dialog },
      lang: quasarLang,
      iconSet: quasarIconSet,
      config: {
        dark: mode === 'dark',
        brand: {
          primary: '#1976D2',
        },
      },
      components: {
        QBtn,
        QCard,
        QCardActions,
        QCardSection,
        QDialog,
        QInput,
        QSelect,
        QTable,
        QTd,
        QToggle,
        QBadge,
      },
    })

    // Official Dark plugin maps Theme Mode (also sets body--dark / body--light)
    Dark.set(mode === 'dark')
  },
  cleanup: cleanupQuasarBodyClasses,
})

function cleanupQuasarBodyClasses(): void {
  document.body.classList.remove('body--dark', 'body--light')
}
