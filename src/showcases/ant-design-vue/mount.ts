import { createApp, type App } from 'vue'
import Antd from 'ant-design-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import { ConfigProvider } from 'ant-design-vue'
import { defineComponent, h } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import 'ant-design-vue/dist/reset.css'
import AntDesignVueShowcase from './AntDesignVueShowcase.vue'

dayjs.locale('zh-cn')

const Root = defineComponent({
  name: 'AntDesignVueShowcaseRoot',
  setup() {
    return () =>
      h(ConfigProvider, { locale: zhCN }, { default: () => h(AntDesignVueShowcase) })
  },
})

export function mountAntDesignVueShowcase(el: HTMLElement): App {
  const app = createApp(Root)
  app.use(Antd)
  app.mount(el)
  return app
}
