import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
// Official dark CSS variables; activated by html.dark (Theme Mode)
import 'element-plus/theme-chalk/dark/css-vars.css'
import { createVueShowcase } from '@/showcases/vue-island/createVueShowcase'
import ElementPlusShowcase from './ElementPlusShowcase.vue'

export const mountElementPlusShowcase = createVueShowcase({
  createRoot: () => ElementPlusShowcase,
  configureApp: (app) => {
    app.use(ElementPlus, { locale: zhCn })
  },
})
