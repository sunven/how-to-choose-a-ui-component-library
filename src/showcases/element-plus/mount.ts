import { createApp, type App } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import ElementPlusShowcase from './ElementPlusShowcase.vue'

export function mountElementPlusShowcase(el: HTMLElement): App {
  const app = createApp(ElementPlusShowcase)
  app.use(ElementPlus, { locale: zhCn })
  app.mount(el)
  return app
}
