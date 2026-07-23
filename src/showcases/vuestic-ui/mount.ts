import { createApp, type App } from 'vue'
import { createVuestic } from 'vuestic-ui'
// Full CSS; vite plugin scopes leaky globals under .vuestic-island (see vite.config.ts)
import 'vuestic-ui/dist/vuestic-ui.css'
// Default icon set: Material Icons (chevrons otherwise render as raw "expand_more")
import 'material-icons/iconfont/material-icons.css'
import { themeModeStore } from '@/domain/themeMode'
import VuesticShowcase from './VuesticShowcase.vue'

export function mountVuesticShowcase(el: HTMLElement): App {
  el.classList.add('vuestic-island')
  const mode = themeModeStore.getSnapshot()
  const app = createApp(VuesticShowcase)
  app.use(
    createVuestic({
      config: {
        colors: {
          currentPresetName: mode === 'dark' ? 'dark' : 'light',
        },
      },
    }),
  )
  app.mount(el)
  return app
}
