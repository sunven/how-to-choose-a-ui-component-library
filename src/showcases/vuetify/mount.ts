import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { zhHans } from 'vuetify/locale'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVueShowcase } from '@/showcases/vue-island/createVueShowcase'
import VuetifyShowcase from './VuetifyShowcase.vue'

export const mountVuetifyShowcase = createVueShowcase({
  createRoot: () => VuetifyShowcase,
  configureApp: (app, mode) => {
    app.use(
      createVuetify({
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
      }),
    )
  },
})
