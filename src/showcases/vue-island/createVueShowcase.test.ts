/* @vitest-environment jsdom */

import { defineComponent, h, type App, type Component } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import type { ThemeMode } from '@/domain/themeMode'
import { createVueShowcase } from './createVueShowcase'

const Root = defineComponent({
  render: () => h('div', 'showcase'),
})

describe('createVueShowcase', () => {
  it('mounts with the current Theme Mode and cleans up on dispose', () => {
    const createRoot = vi.fn<(mode: ThemeMode) => Component>(() => Root)
    const configureApp = vi.fn<(app: App, mode: ThemeMode) => void>()
    const cleanup = vi.fn<() => void>()
    const mount = createVueShowcase({ createRoot, configureApp, cleanup })
    const element = document.createElement('div')

    const dispose = mount(element, 'dark')

    expect(createRoot).toHaveBeenCalledWith('dark')
    expect(configureApp).toHaveBeenCalledWith(expect.anything(), 'dark')
    expect(element.textContent).toContain('showcase')

    dispose()

    expect(cleanup).toHaveBeenCalledOnce()
    expect(element.childElementCount).toBe(0)
  })

  it('cleans up when configuration fails', () => {
    const cleanup = vi.fn<() => void>()
    const mount = createVueShowcase({
      createRoot: () => Root,
      configureApp: () => {
        throw new Error('config failed')
      },
      cleanup,
    })

    expect(() => mount(document.createElement('div'), 'light')).toThrow('config failed')
    expect(cleanup).toHaveBeenCalledOnce()
  })
})
