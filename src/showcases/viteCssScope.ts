import type { Plugin } from 'vite'
import postcss from 'postcss'
import prefixSelector from 'postcss-prefix-selector'
import surfaces from './librarySurfaces.json'

/**
 * Scoped-prefix plugin for libraries whose official CSS ships document-level
 * resets and utilities that collide with the App Shell / Tailwind.
 *
 * - Document selectors (`:root`, `html`, `body`) are re-homed to the island root.
 * - Pure component selectors stay global so teleported overlays still style.
 * - Everything else (utilities, resets, grid) is scoped under the island root.
 */
interface CssScopeConfig {
  readonly name: string
  readonly rootClassName: string
  readonly documentTags: readonly string[]
  readonly componentPrefix: string
  readonly matchId: (cleanId: string) => boolean
  readonly keepDocumentSelector?: (selector: string) => boolean
}

function matchesDocumentSelector(selector: string, tag: string): boolean {
  if (selector === tag) return true
  if (tag.startsWith(':')) return selector.startsWith(tag)
  return (
    selector.startsWith(`${tag}.`) ||
    selector.startsWith(`${tag} `) ||
    selector.startsWith(`${tag},`)
  )
}

function rewriteDocumentSelector(
  selector: string,
  tags: readonly string[],
  prefix: string,
): string {
  let rewritten = selector
  for (const tag of tags) {
    const pattern = tag.startsWith(':')
      ? new RegExp(`${tag}\\b`, 'g')
      : new RegExp(`\\b${tag}\\b`, 'g')
    rewritten = rewritten.replace(pattern, prefix)
  }
  return rewritten
}

function stripComponentClasses(selector: string, componentPrefix: string): string {
  return selector
    .replace(new RegExp(`\\.${componentPrefix}[\\w-]+`, 'g'), '')
    .replace(/::?[\w-]+(\([^)]*\))?/g, '')
    .replace(/\[[^\]]*]/g, '')
    .replace(/#[\w-]+/g, '')
    .replace(/[\s>+~.,*='"()]/g, '')
    .trim()
}

function createCssScopePlugin(config: CssScopeConfig): Plugin {
  const prefix = `.${config.rootClassName}`
  const componentClass = `.${config.componentPrefix}`
  const componentAttribute = `[class*="${config.componentPrefix}"]`
  const componentAttributeAlt = `[class*='${config.componentPrefix}']`

  return {
    name: config.name,
    enforce: 'pre',
    async transform(code, id) {
      const cleanId = id.split('?')[0].replace(/\\/g, '/')
      if (!config.matchId(cleanId)) {
        return null
      }

      const result = await postcss([
        prefixSelector({
          prefix,
          transform(_prefix, selector, prefixedSelector) {
            const trimmed = selector.trim()

            if (
              config.documentTags.some((tag) =>
                matchesDocumentSelector(trimmed, tag),
              )
            ) {
              if (config.keepDocumentSelector?.(trimmed)) return selector
              return rewriteDocumentSelector(trimmed, config.documentTags, prefix)
            }

            const hasComponentClass =
              trimmed.includes(componentClass) ||
              trimmed.includes(componentAttribute) ||
              trimmed.includes(componentAttributeAlt)
            if (
              hasComponentClass &&
              !stripComponentClasses(trimmed, config.componentPrefix)
            ) {
              return selector
            }

            return prefixedSelector
          },
        }),
      ]).process(code, { from: cleanId })

      return { code: result.css, map: null }
    },
  }
}

/**
 * Vuestic ships a full utility sheet (`.px-3`, `.flex>*`, etc.) that collides
 * with Tailwind on the App Shell. Scope *all* non-component selectors under the
 * Vuestic surface root. Leave pure `.va-*` component rules unscoped so
 * teleported modals still look correct.
 */
export function scopeVuesticCss(): Plugin {
  return createCssScopePlugin({
    name: 'scope-vuestic-css',
    rootClassName: surfaces['vuestic-ui'].rootClassName,
    documentTags: [':root', ':host', 'body'],
    componentPrefix: 'va-',
    matchId: (id) => id.endsWith('/vuestic-ui/dist/vuestic-ui.css'),
  })
}

/**
 * Vuetify ships Material utility helpers (`.bg-white { background: #fff !important }`,
 * etc.) that **collide with Tailwind on the App Shell**. Scope non-component selectors
 * under the Vuetify surface root. Keep pure `.v-*` component rules global so
 * teleported overlays (v-dialog / v-overlay) still style correctly.
 */
export function scopeVuetifyCss(): Plugin {
  return createCssScopePlugin({
    name: 'scope-vuetify-css',
    rootClassName: surfaces.vuetify.rootClassName,
    documentTags: [':root', 'html', 'body'],
    componentPrefix: 'v-',
    matchId: (id) =>
      id.endsWith('/vuetify/lib/styles/main.css') ||
      id.endsWith('/vuetify/dist/vuetify.css'),
  })
}

/**
 * Quasar ships utility helpers (`.bg-white { background: #fff !important }`, flex
 * helpers, etc.) that collide with Tailwind on the App Shell — same class of problem
 * as Vuetify. Scope non-component selectors under the Quasar surface root; keep pure
 * `.q-*` component rules global so teleported dialogs / notifications still style correctly.
 */
export function scopeQuasarCss(): Plugin {
  return createCssScopePlugin({
    name: 'scope-quasar-css',
    rootClassName: surfaces.quasar.rootClassName,
    documentTags: [':root', 'html', 'body'],
    componentPrefix: 'q-',
    keepDocumentSelector: (selector) =>
      selector.includes('.q-') || selector.includes('body--'),
    matchId: (id) =>
      id.endsWith('/quasar/dist/quasar.css') ||
      id.endsWith('/quasar/dist/quasar.prod.css'),
  })
}
