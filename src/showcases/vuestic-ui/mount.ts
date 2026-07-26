import { createApp } from 'vue'
import { createVuestic } from 'vuestic-ui'
// Full CSS; vite plugin scopes leaky globals under .vuestic-island (see vite.config.ts)
import 'vuestic-ui/dist/vuestic-ui.css'
// Default icon set: Material Icons (chevrons otherwise render as raw "expand_more")
import 'material-icons/iconfont/material-icons.css'
import { themeModeStore } from '@/domain/themeMode'
import type { DisposeVueShowcase } from '@/showcases/vue-island/VueIslandHost'
import VuesticShowcase from './VuesticShowcase.vue'

export function mountVuesticShowcase(el: HTMLElement): DisposeVueShowcase {
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
  return () => app.unmount()
}
