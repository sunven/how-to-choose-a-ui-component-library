import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
// Official dark CSS variables; activated by html.dark (Theme Mode)
import 'element-plus/theme-chalk/dark/css-vars.css'
import type { DisposeVueShowcase } from '@/showcases/vue-island/VueIslandHost'
import ElementPlusShowcase from './ElementPlusShowcase.vue'

export function mountElementPlusShowcase(el: HTMLElement): DisposeVueShowcase {
  const app = createApp(ElementPlusShowcase)
  app.use(ElementPlus, { locale: zhCn })
  app.mount(el)
  return () => app.unmount()
}
