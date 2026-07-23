/**
 * L1 style isolation — time-based single-mount CSS lifecycle.
 *
 * While a library is active, track global stylesheets Vite (or the library)
 * injects into <head>. On leave: cache their content and remove them from the
 * DOM so the next library / shell is not polluted. On return: re-apply the
 * cache (ESM CSS side-effects only run once).
 *
 * CSS-in-JS runtimes (Emotion, antd cssinjs, css-render, …) are left alone —
 * their JS cache owns inject/remove; tearing out those nodes breaks remount.
 *
 * ## Route-switch race (fixed)
 *
 * React.lazy injects CSS during *render*, but effect cleanups run *after*
 * paint. The previous library's MutationObserver can therefore claim the next
 * library's newly injected `<style>`/`<link>`, tag them as the old library,
 * and delete them on cleanup — while Vite will not re-run the CSS side-effect.
 * Symptom: ant-design → semi-design looks unstyled; hard refresh of semi is fine.
 *
 * Fix:
 * 1. Ownership map + **activation id** so a newer activate can steal nodes.
 * 2. **Deferred removal** (microtask): only remove a node if it is still owned
 *    by the disposing activation — giving the next activate a chance to steal.
 * 3. `useLayoutEffect` so steal happens before paint.
 */

import { useLayoutEffect } from 'react'
import type { LibraryId } from '@/domain/libraries'

type CachedStyle =
  | { kind: 'style'; cssText: string }
  | { kind: 'link'; href: string }

const styleCache = new Map<LibraryId, CachedStyle[]>()

/** Library that currently owns a managed stylesheet node. */
const styleOwner = new WeakMap<Element, LibraryId>()
/** Activation that currently owns the node (defeats StrictMode double-mount). */
const styleActivation = new WeakMap<Element, number>()

let nextActivationId = 1

/** Styles present after shell CSS load; never owned by a showcase library. */
let shellBaseline: Set<Element> | null = null

export function captureShellStyleBaseline() {
  shellBaseline = new Set(listHeadStylesheets())
}

function listHeadStylesheets(): Element[] {
  return Array.from(document.head.querySelectorAll('style, link[rel="stylesheet"]'))
}

function isStylesheetNode(node: Node): node is HTMLStyleElement | HTMLLinkElement {
  if (node instanceof HTMLStyleElement) return true
  if (node instanceof HTMLLinkElement && node.rel === 'stylesheet') return true
  return false
}

/** Skip runtime CSS-in-JS sheets; only manage static / Vite-injected globals. */
function shouldManage(el: HTMLElement): boolean {
  if (el.hasAttribute('data-showcase-lib')) return true
  // Emotion (MUI, etc.)
  if (el.hasAttribute('data-emotion')) return false
  // styled-components
  if (el.hasAttribute('data-styled')) return false
  // Ant Design 5 cssinjs
  if (el.dataset.cssHash != null) return false
  // naive-ui css-render
  if (el.hasAttribute('cssr-id')) return false
  return true
}

function serialize(el: Element): CachedStyle | null {
  if (el instanceof HTMLStyleElement) {
    return { kind: 'style', cssText: el.textContent ?? '' }
  }
  if (el instanceof HTMLLinkElement && el.rel === 'stylesheet' && el.href) {
    return { kind: 'link', href: el.href }
  }
  return null
}

function recreate(item: CachedStyle, libraryId: LibraryId): HTMLElement {
  if (item.kind === 'style') {
    const el = document.createElement('style')
    el.textContent = item.cssText
    el.setAttribute('data-showcase-lib', libraryId)
    return el
  }
  const el = document.createElement('link')
  el.rel = 'stylesheet'
  el.href = item.href
  el.setAttribute('data-showcase-lib', libraryId)
  return el
}

function assignOwner(el: Element, libraryId: LibraryId, activationId: number) {
  styleOwner.set(el, libraryId)
  styleActivation.set(el, activationId)
  el.setAttribute('data-showcase-lib', libraryId)
}

function reapplyCached(libraryId: LibraryId, activationId: number): Set<Element> {
  const claimed = new Set<Element>()
  const items = styleCache.get(libraryId)
  if (!items?.length) return claimed
  for (const item of items) {
    const el = recreate(item, libraryId)
    assignOwner(el, libraryId, activationId)
    document.head.appendChild(el)
    claimed.add(el)
  }
  return claimed
}

function cacheKey(item: CachedStyle): string {
  return item.kind === 'style'
    ? `style:${item.cssText.length}:${item.cssText.slice(0, 64)}`
    : `link:${item.href}`
}

/**
 * Activate CSS lifecycle for the current Candidate Library.
 * Call on mount; returns a disposer for unmount / library switch.
 */
export function activateLibraryStyles(libraryId: LibraryId): () => void {
  const activationId = nextActivationId++
  const claimed = reapplyCached(libraryId, activationId)

  const claim = (node: Node) => {
    if (!isStylesheetNode(node) || !shouldManage(node)) return
    if (shellBaseline?.has(node)) return
    // Steal ownership from a previous activation if it mis-claimed during the
    // render→effect gap (see file header). Incoming activation always wins.
    assignOwner(node, libraryId, activationId)
    claimed.add(node)
  }

  // React.lazy may inject CSS during render, before this effect runs.
  for (const el of listHeadStylesheets()) {
    claim(el)
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        claim(node)
      }
    }
  })
  observer.observe(document.head, { childList: true })

  return () => {
    observer.disconnect()

    // Snapshot candidates now; remove only if still owned by *this activation*
    // after a microtask (next library / StrictMode remount can steal first).
    const candidates = new Set(claimed)
    document
      .querySelectorAll(`[data-showcase-lib="${CSS.escape(libraryId)}"]`)
      .forEach((el) => candidates.add(el))
    claimed.clear()

    queueMicrotask(() => {
      const items: CachedStyle[] = []
      const seen = new Set<string>()

      const take = (el: Element) => {
        if (styleActivation.get(el) !== activationId) return
        if (styleOwner.get(el) !== libraryId) return
        const serialized = serialize(el)
        if (serialized) {
          const key = cacheKey(serialized)
          if (!seen.has(key)) {
            seen.add(key)
            items.push(serialized)
          }
        }
        styleOwner.delete(el)
        styleActivation.delete(el)
        el.remove()
      }

      for (const el of candidates) {
        if (el.isConnected) take(el)
      }

      if (items.length > 0) {
        styleCache.set(libraryId, items)
      }
    })
  }
}

/** Hook: bind L1 style lifecycle to the active library route. */
export function useLibraryStyleIsolation(libraryId: LibraryId) {
  // layout: steal ownership before paint so route switches don't flash unstyled
  useLayoutEffect(() => activateLibraryStyles(libraryId), [libraryId])
}
