import { createApp, defineComponent, h } from 'vue'
import {
  NConfigProvider,
  NDialogProvider,
  NMessageProvider,
  darkTheme,
  dateZhCN,
  zhCN,
} from 'naive-ui'
import { themeModeStore } from '@/domain/themeMode'
import type { DisposeVueShowcase } from '@/showcases/vue-island/VueIslandHost'
import NaiveUiShowcase from './NaiveUiShowcase.vue'

const Root = defineComponent({
  name: 'NaiveUiShowcaseRoot',
  setup() {
    // Snapshot at mount; Island remounts when Theme Mode changes
    const mode = themeModeStore.getSnapshot()
    return () =>
      h(
        NConfigProvider,
        {
          locale: zhCN,
          dateLocale: dateZhCN,
          theme: mode === 'dark' ? darkTheme : null,
        },
        {
          default: () =>
            h(NMessageProvider, null, {
              default: () =>
                h(NDialogProvider, null, {
                  default: () => h(NaiveUiShowcase),
                }),
            }),
        },
      )
  },
})

export function mountNaiveUiShowcase(el: HTMLElement): DisposeVueShowcase {
  const app = createApp(Root)
  app.mount(el)
  return () => app.unmount()
}
