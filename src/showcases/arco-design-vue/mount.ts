import { createApp, defineComponent, h, type App } from 'vue'
import ArcoVue, { ConfigProvider } from '@arco-design/web-vue'
import zhCN from '@arco-design/web-vue/es/locale/lang/zh-cn'
import '@arco-design/web-vue/dist/arco.css'
import ArcoDesignVueShowcase from './ArcoDesignVueShowcase.vue'

const Root = defineComponent({
  name: 'ArcoDesignVueShowcaseRoot',
  setup() {
    return () =>
      h(ConfigProvider, { locale: zhCN }, { default: () => h(ArcoDesignVueShowcase) })
  },
})

export function mountArcoDesignVueShowcase(el: HTMLElement): App {
  const app = createApp(Root)
  app.use(ArcoVue)
  app.mount(el)
  return app
}
