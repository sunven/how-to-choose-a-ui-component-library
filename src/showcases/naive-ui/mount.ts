import {
  NConfigProvider,
  NDialogProvider,
  NMessageProvider,
  darkTheme,
  dateZhCN,
  zhCN,
} from 'naive-ui'
import { defineComponent, h } from 'vue'
import type { ThemeMode } from '@/domain/themeMode'
import { createVueShowcase } from '@/showcases/vue-island/createVueShowcase'
import NaiveUiShowcase from './NaiveUiShowcase.vue'

const createNaiveUiRoot = (mode: ThemeMode) =>
  defineComponent({
    name: 'NaiveUiShowcaseRoot',
    setup() {
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

export const mountNaiveUiShowcase = createVueShowcase({
  createRoot: createNaiveUiRoot,
})
