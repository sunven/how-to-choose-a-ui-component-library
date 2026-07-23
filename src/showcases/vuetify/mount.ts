import { createApp, type App } from 'vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { zhHans } from 'vuetify/locale'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { themeModeStore } from '@/domain/themeMode'
import VuetifyShowcase from './VuetifyShowcase.vue'

export function mountVuetifyShowcase(el: HTMLElement): App {
  // Host for scoped Vuetify utilities (see vite.config scopeVuetifyCss)
  el.classList.add('vuetify-island')
  const mode = themeModeStore.getSnapshot()
  const vuetify = createVuetify({
    components,
    directives,
    theme: {
      defaultTheme: mode,
      themes: {
        light: { dark: false },
        dark: { dark: true },
      },
    },
    locale: {
      locale: 'zhHans',
      messages: { zhHans },
    },
    defaults: {
      VBtn: { rounded: 'md' },
    },
  })

  const app = createApp(VuetifyShowcase)
  app.use(vuetify)
  app.mount(el)
  return app
}
