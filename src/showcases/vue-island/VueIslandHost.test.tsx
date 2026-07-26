/* @vitest-environment jsdom */

import { act, StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, expect, test, vi } from 'vitest'
import { themeModeStore } from '@/domain/themeMode'
import {
  VueIslandHost,
  type MountVueShowcase,
  type VueShowcaseLoader,
} from './VueIslandHost'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

let root: Root | null = null
let container: HTMLDivElement | null = null

afterEach(async () => {
  if (root) {
    await act(async () => root?.unmount())
  }
  container?.remove()
  root = null
  container = null
  themeModeStore.set('light')
  localStorage.clear()
})

test('mounts a loaded Vue Showcase and disposes it on unmount', async () => {
  let resolveLoader: ((mount: MountVueShowcase) => void) | undefined
  const dispose = vi.fn()
  const load: VueShowcaseLoader = () =>
    new Promise((resolve) => {
      resolveLoader = resolve
    })

  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)

  await act(async () => {
    root?.render(
      <VueIslandHost
        libraryName="Test Library"
        rootClassName="test-library-island"
        load={load}
      />,
    )
  })

  await act(async () => {
    resolveLoader?.((element) => {
      element.textContent = 'mounted Showcase'
      return dispose
    })
    await Promise.resolve()
  })

  expect(container.textContent).toBe('mounted Showcase')

  await act(async () => root?.unmount())
  root = null

  expect(dispose).toHaveBeenCalledOnce()
})

test('shows a loading state until the Vue Showcase mounts', async () => {
  let resolveLoader: ((mount: MountVueShowcase) => void) | undefined
  const load: VueShowcaseLoader = () =>
    new Promise((resolve) => {
      resolveLoader = resolve
    })

  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)

  await act(async () => {
    root?.render(
      <VueIslandHost
        libraryName="Test Library"
        rootClassName="test-library-island"
        load={load}
      />,
    )
  })

  expect(container.textContent).toBe('加载 Test Library Showcase…')

  await act(async () => {
    resolveLoader?.((element) => {
      element.textContent = 'mounted Showcase'
      return () => undefined
    })
    await Promise.resolve()
  })

  expect(container.textContent).toBe('mounted Showcase')
})

test('shows a candidate-specific failure when the loader rejects', async () => {
  const load: VueShowcaseLoader = async () => {
    throw new Error('chunk unavailable')
  }

  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)

  await act(async () => {
    root?.render(
      <VueIslandHost
        libraryName="Test Library"
        rootClassName="test-library-island"
        load={load}
      />,
    )
    await Promise.resolve()
  })

  expect(container.textContent).toBe('Test Library Showcase 加载失败：chunk unavailable')
})

test('does not mount when the loader resolves after the host unmounts', async () => {
  let resolveLoader: ((mount: MountVueShowcase) => void) | undefined
  const mount = vi.fn<MountVueShowcase>(() => () => undefined)
  const load: VueShowcaseLoader = () =>
    new Promise((resolve) => {
      resolveLoader = resolve
    })

  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)

  await act(async () => {
    root?.render(
      <VueIslandHost
        libraryName="Test Library"
        rootClassName="test-library-island"
        load={load}
      />,
    )
  })
  await act(async () => root?.unmount())
  root = null

  await act(async () => {
    resolveLoader?.(mount)
    await Promise.resolve()
  })

  expect(mount).not.toHaveBeenCalled()
})

test('keeps one mounted Vue Showcase under React StrictMode', async () => {
  const dispose = vi.fn()
  const mount = vi.fn<MountVueShowcase>((element) => {
    element.textContent = 'mounted Showcase'
    return dispose
  })
  const load = vi.fn<VueShowcaseLoader>(async () => mount)

  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)

  await act(async () => {
    root?.render(
      <StrictMode>
        <VueIslandHost
          libraryName="Test Library"
          rootClassName="test-library-island"
          load={load}
        />
      </StrictMode>,
    )
    await Promise.resolve()
  })

  expect(mount).toHaveBeenCalledOnce()
  expect(container.textContent).toBe('mounted Showcase')
})

test('disposes and remounts the Vue Showcase when Theme Mode changes', async () => {
  const events: string[] = []
  let mountNumber = 0
  const load: VueShowcaseLoader = async () => (element) => {
    mountNumber += 1
    const currentMount = mountNumber
    events.push(`mount ${currentMount}`)
    element.textContent = `mounted Showcase ${currentMount}`
    return () => events.push(`dispose ${currentMount}`)
  }

  themeModeStore.set('light')
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)

  await act(async () => {
    root?.render(
      <VueIslandHost
        libraryName="Test Library"
        rootClassName="test-library-island"
        load={load}
      />,
    )
    await Promise.resolve()
  })

  await act(async () => {
    themeModeStore.set('dark')
    await Promise.resolve()
  })

  expect(events).toEqual(['mount 1', 'dispose 1', 'mount 2'])
  expect(container.textContent).toBe('mounted Showcase 2')
})
