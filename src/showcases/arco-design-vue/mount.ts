import ArcoVue, { ConfigProvider } from '@arco-design/web-vue'
import zhCN from '@arco-design/web-vue/es/locale/lang/zh-cn'
import '@arco-design/web-vue/dist/arco.css'
import { defineComponent, h } from 'vue'
import { createVueShowcase } from '@/showcases/vue-island/createVueShowcase'
import ArcoDesignVueShowcase from './ArcoDesignVueShowcase.vue'

// Dark: body[arco-theme=dark] set by themeModeStore (Arco official)

const Root = defineComponent({
  name: 'ArcoDesignVueShowcaseRoot',
  setup() {
    return () =>
      h(ConfigProvider, { locale: zhCN }, {
        default: () => h(ArcoDesignVueShowcase),
      })
  },
})

export const mountArcoDesignVueShowcase = createVueShowcase({
  createRoot: () => Root,
  configureApp: (app) => {
    app.use(ArcoVue)
  },
})
