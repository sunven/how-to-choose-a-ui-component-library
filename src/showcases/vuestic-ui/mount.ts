import { createVuestic } from 'vuestic-ui'
// Full CSS; vite plugin scopes leaky globals under .vuestic-island (see vite.config.ts)
import 'vuestic-ui/dist/vuestic-ui.css'
// Default icon set: Material Icons (chevrons otherwise render as raw "expand_more")
import 'material-icons/iconfont/material-icons.css'
import { createVueShowcase } from '@/showcases/vue-island/createVueShowcase'
import VuesticShowcase from './VuesticShowcase.vue'

export const mountVuesticShowcase = createVueShowcase({
  createRoot: () => VuesticShowcase,
  configureApp: (app, mode) => {
    app.use(
      createVuestic({
        config: {
          colors: {
            currentPresetName: mode === 'dark' ? 'dark' : 'light',
          },
        },
      }),
    )
  },
})
