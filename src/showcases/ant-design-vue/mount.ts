import Antd, { ConfigProvider, theme } from 'ant-design-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import { defineComponent, h } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import 'ant-design-vue/dist/reset.css'
import type { ThemeMode } from '@/domain/themeMode'
import { createVueShowcase } from '@/showcases/vue-island/createVueShowcase'
import AntDesignVueShowcase from './AntDesignVueShowcase.vue'

dayjs.locale('zh-cn')

const createAntDesignVueRoot = (mode: ThemeMode) =>
  defineComponent({
    name: 'AntDesignVueShowcaseRoot',
    setup() {
      return () =>
        h(
          ConfigProvider,
          {
            locale: zhCN,
            theme: {
              algorithm:
                mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
            },
          },
          { default: () => h(AntDesignVueShowcase) },
        )
    },
  })

export const mountAntDesignVueShowcase = createVueShowcase({
  createRoot: createAntDesignVueRoot,
  configureApp: (app) => {
    app.use(Antd)
  },
})
