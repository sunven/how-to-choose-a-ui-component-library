import { createApp } from 'vue'
import Antd, { theme } from 'ant-design-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import { ConfigProvider } from 'ant-design-vue'
import { defineComponent, h } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import 'ant-design-vue/dist/reset.css'
import { themeModeStore } from '@/domain/themeMode'
import type { DisposeVueShowcase } from '@/showcases/vue-island/VueIslandHost'
import AntDesignVueShowcase from './AntDesignVueShowcase.vue'

dayjs.locale('zh-cn')

const Root = defineComponent({
  name: 'AntDesignVueShowcaseRoot',
  setup() {
    const mode = themeModeStore.getSnapshot()
    return () =>
      h(
        ConfigProvider,
        {
          locale: zhCN,
          theme: {
            algorithm: mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
          },
        },
        { default: () => h(AntDesignVueShowcase) },
      )
  },
})

export function mountAntDesignVueShowcase(el: HTMLElement): DisposeVueShowcase {
  const app = createApp(Root)
  app.use(Antd)
  app.mount(el)
  return () => app.unmount()
}
