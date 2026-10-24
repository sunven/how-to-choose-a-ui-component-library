/* @vitest-environment jsdom */

import { afterEach, describe, expect, it } from 'vitest'
import {
  activateLibraryStyles,
  captureShellStyleBaseline,
  injectLibraryStyle,
} from './styleIsolation'

afterEach(() => {
  document.head.replaceChildren()
})

describe('injectLibraryStyle', () => {
  it('tags the style for L1 custody and removes it on dispose', () => {
    const dispose = injectLibraryStyle('bootstrap', '.x { color: red; }')
    const style = document.head.querySelector(
      'style[data-showcase-lib="bootstrap"]',
    )

    expect(style?.textContent).toContain('color: red')

    dispose()

    expect(
      document.head.querySelector('style[data-showcase-lib="bootstrap"]'),
    ).toBeNull()
  })
})

describe('activateLibraryStyles', () => {
  it('caches a claimed library style and reapplies it on reactivation', async () => {
    captureShellStyleBaseline()
    const removeInjected = injectLibraryStyle('bulma', '.x { color: red; }')
    const dispose = activateLibraryStyles('bulma')

    dispose()
    await Promise.resolve()
    expect(
      document.head.querySelector('style[data-showcase-lib="bulma"]'),
    ).toBeNull()

    const reactivate = activateLibraryStyles('bulma')
    expect(
      document.head.querySelector('style[data-showcase-lib="bulma"]')
        ?.textContent,
    ).toContain('color: red')

    reactivate()
    removeInjected()
    await Promise.resolve()
  })
})
