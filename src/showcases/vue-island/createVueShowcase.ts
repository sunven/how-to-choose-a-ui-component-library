import { createApp, type App, type Component } from 'vue'
import type { ThemeMode } from '@/domain/themeMode'
import type { MountVueShowcase } from './VueIslandHost'

export interface VueShowcaseConfig {
  createRoot: (mode: ThemeMode) => Component
  configureApp?: (app: App, mode: ThemeMode) => void
  cleanup?: () => void
}

export function createVueShowcase(config: VueShowcaseConfig): MountVueShowcase {
  return (element, mode) => {
    const app = createApp(config.createRoot(mode))

    try {
      config.configureApp?.(app, mode)
      app.mount(element)
    } catch (error) {
      config.cleanup?.()
      throw error
    }

    return () => {
      try {
        app.unmount()
      } finally {
        config.cleanup?.()
      }
    }
  }
}
