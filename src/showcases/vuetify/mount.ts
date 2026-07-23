import { createApp, type App } from 'vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { zhHans } from 'vuetify/locale'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import VuetifyShowcase from './VuetifyShowcase.vue'

export function mountVuetifyShowcase(el: HTMLElement): App {
  const vuetify = createVuetify({
    components,
    directives,
    theme: { defaultTheme: 'light' },
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
