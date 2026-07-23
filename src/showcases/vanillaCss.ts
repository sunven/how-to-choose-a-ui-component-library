/**
 * Strategy B for Vanilla CSS frameworks (Bootstrap / Bulma):
 * inject pre-built `@scope (.showcase-*)` CSS as ?raw (skips Vite
 * PostCSS/Tailwind — that path hung the build), unload on leave via L1.
 *
 * Why @scope (not global inject): Bootstrap utilities use !important and share
 * names with Tailwind (p-*, m-*, gap-*, …). Unscoped inject rewrote the App
 * Shell grid (showcase vs profile column ratio).
 *
 * Class-name isolation vs daisyUI: daisyUI uses prefix `dy-` so it no longer
 * owns global `.btn`/`.select`/`.table`/`.modal`/`.input`.
 * Regenerate sheets: `node scripts/scope-vanilla-css.mjs`
 */
import type { LibraryId } from '@/domain/libraries'

/** Inject CSS for the active Vanilla library; returns disposer. */
export function injectScopedShowcaseCss(
  libraryId: LibraryId,
  cssText: string,
): () => void {
  const el = document.createElement('style')
  el.setAttribute('data-showcase-lib', libraryId)
  el.textContent = cssText
  document.head.appendChild(el)
  return () => {
    el.remove()
  }
}
