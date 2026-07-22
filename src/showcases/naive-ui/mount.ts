import { createApp, defineComponent, h, type App } from 'vue'
import {
  NConfigProvider,
  NDialogProvider,
  NMessageProvider,
  dateZhCN,
  zhCN,
} from 'naive-ui'
import NaiveUiShowcase from './NaiveUiShowcase.vue'

const Root = defineComponent({
  name: 'NaiveUiShowcaseRoot',
  setup() {
    return () =>
      h(
        NConfigProvider,
        { locale: zhCN, dateLocale: dateZhCN },
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

export function mountNaiveUiShowcase(el: HTMLElement): App {
  const app = createApp(Root)
  app.mount(el)
  return app
}
