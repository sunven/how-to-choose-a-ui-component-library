import type { Plugin } from 'vite'
import postcss from 'postcss'
import prefixSelector from 'postcss-prefix-selector'
import surfaces from './librarySurfaces.json'

const vuesticPrefix = `.${surfaces['vuestic-ui'].rootClassName}`
const vuetifyPrefix = `.${surfaces.vuetify.rootClassName}`
const quasarPrefix = `.${surfaces.quasar.rootClassName}`

/**
 * Vuestic ships a full utility sheet (`.px-3`, `.flex>*`, etc.) that collides
 * with Tailwind on the App Shell. Scope *all* non-component selectors under the
 * Vuestic surface root. Leave pure `.va-*` component rules unscoped so
 * teleported modals still look correct.
 */
export function scopeVuesticCss(): Plugin {
  return {
    name: 'scope-vuestic-css',
    enforce: 'pre',
    async transform(code, id) {
      const cleanId = id.split('?')[0]
      if (!cleanId.replace(/\\/g, '/').endsWith('/vuestic-ui/dist/vuestic-ui.css')) {
        return null
      }

      const result = await postcss([
        prefixSelector({
          prefix: vuesticPrefix,
          transform(_prefix, selector, prefixedSelector) {
            const s = selector.trim()

            // Theme tokens → island root (vars without styling document body)
            if (
              s === ':root' ||
              s.startsWith(':root') ||
              s === ':host' ||
              s.startsWith(':host') ||
              s === 'body' ||
              s.startsWith('body.') ||
              s.startsWith('body ') ||
              s.startsWith('body,')
            ) {
              return s
                .replace(/:root\b/g, vuesticPrefix)
                .replace(/:host\b/g, vuesticPrefix)
                .replace(/\bbody\b/g, vuesticPrefix)
            }

            // Pure Vuestic component selectors stay global (teleport/modals)
            // e.g. `.va-button`, `.va-modal__dialog:focus` — but NOT `.px-3` utilities
            if (s.includes('.va-') || s.includes('[class*="va-"]') || s.includes("[class*='va-']")) {
              const nonVaResidue = s
                .replace(/\.va-[\w-]+/g, '')
                .replace(/::?[\w-]+(\([^)]*\))?/g, '')
                .replace(/\[[^\]]*]/g, '')
                .replace(/#[\w-]+/g, '')
                .replace(/[\s>+~.,*='"()]/g, '')
                .trim()
              if (!nonVaResidue) return selector
            }

            // Everything else (Tailwind-colliding utilities, resets, grid) → scoped
            return prefixedSelector
          },
        }),
      ]).process(code, { from: cleanId })

      return { code: result.css, map: null }
    },
  }
}

/**
 * Vuetify ships Material utility helpers (`.bg-white { background: #fff !important }`,
 * etc.) that **collide with Tailwind on the App Shell**. In dark Theme Mode the shell
 * uses `bg-white dark:bg-slate-900`; Vuetify's `!important` wins → white header +
 * light text = washed-out chrome when landing on Vuetify (e.g. Arco Vue → Vuetify).
 *
 * Scope non-component selectors under the Vuetify surface root. Keep pure `.v-*`
 * component rules global so teleported overlays (v-dialog / v-overlay) still style correctly.
 */
export function scopeVuetifyCss(): Plugin {
  return {
    name: 'scope-vuetify-css',
    enforce: 'pre',
    async transform(code, id) {
      const cleanId = id.split('?')[0].replace(/\\/g, '/')
      // `import 'vuetify/styles'` → …/vuetify/lib/styles/main.css
      if (!cleanId.endsWith('/vuetify/lib/styles/main.css') && !cleanId.endsWith('/vuetify/dist/vuetify.css')) {
        return null
      }

      const result = await postcss([
        prefixSelector({
          prefix: vuetifyPrefix,
          transform(_prefix, selector, prefixedSelector) {
            const s = selector.trim()

            // Resets / tokens that target document → island root only
            if (
              s === ':root' ||
              s.startsWith(':root') ||
              s === 'html' ||
              s.startsWith('html.') ||
              s.startsWith('html ') ||
              s.startsWith('html,') ||
              s === 'body' ||
              s.startsWith('body.') ||
              s.startsWith('body ') ||
              s.startsWith('body,')
            ) {
              return s
                .replace(/:root\b/g, vuetifyPrefix)
                .replace(/\bhtml\b/g, vuetifyPrefix)
                .replace(/\bbody\b/g, vuetifyPrefix)
            }

            // Pure Vuetify component / theme / overlay selectors stay global
            // e.g. `.v-btn`, `.v-overlay__content`, `.v-theme--dark` — not `.bg-white`
            if (
              s.includes('.v-') ||
              s.includes('[class*="v-"]') ||
              s.includes("[class*='v-']") ||
              s.includes('.v-theme--')
            ) {
              const nonVResidue = s
                .replace(/\.v-[\w-]+/g, '')
                .replace(/::?[\w-]+(\([^)]*\))?/g, '')
                .replace(/\[[^\]]*]/g, '')
                .replace(/#[\w-]+/g, '')
                .replace(/[\s>+~.,*='"()]/g, '')
                .trim()
              if (!nonVResidue) return selector
            }

            // Tailwind-colliding utilities (bg-white, border, elevation-*, …) → scoped
            return prefixedSelector
          },
        }),
      ]).process(code, { from: cleanId })

      return { code: result.css, map: null }
    },
  }
}

/**
 * Quasar ships utility helpers (`.bg-white { background: #fff !important }`, flex
 * helpers, etc.) that collide with Tailwind on the App Shell — same class of problem
 * as Vuetify. Scope non-component selectors under the Quasar surface root; keep pure
 * `.q-*` component rules global so teleported dialogs / notifications still style correctly.
 */
export function scopeQuasarCss(): Plugin {
  return {
    name: 'scope-quasar-css',
    enforce: 'pre',
    async transform(code, id) {
      const cleanId = id.split('?')[0].replace(/\\/g, '/')
      if (
        !cleanId.endsWith('/quasar/dist/quasar.css') &&
        !cleanId.endsWith('/quasar/dist/quasar.prod.css')
      ) {
        return null
      }

      const result = await postcss([
        prefixSelector({
          prefix: quasarPrefix,
          transform(_prefix, selector, prefixedSelector) {
            const s = selector.trim()

            if (
              s === ':root' ||
              s.startsWith(':root') ||
              s === 'html' ||
              s.startsWith('html.') ||
              s.startsWith('html ') ||
              s.startsWith('html,') ||
              s === 'body' ||
              s.startsWith('body.') ||
              s.startsWith('body ') ||
              s.startsWith('body,')
            ) {
              // Keep body.body--dark .q-* global (Dark plugin sets body class);
              // only re-home bare html/body token roots to the island.
              if (s.includes('.q-') || s.includes('body--')) {
                return selector
              }
              return s
                .replace(/:root\b/g, quasarPrefix)
                .replace(/\bhtml\b/g, quasarPrefix)
                .replace(/\bbody\b/g, quasarPrefix)
            }

            // Pure Quasar component / state selectors stay global (teleport)
            if (s.includes('.q-') || s.includes('[class*="q-"]') || s.includes("[class*='q-']")) {
              const nonQResidue = s
                .replace(/\.q-[\w-]+/g, '')
                .replace(/::?[\w-]+(\([^)]*\))?/g, '')
                .replace(/\[[^\]]*]/g, '')
                .replace(/#[\w-]+/g, '')
                .replace(/[\s>+~.,*='"()]/g, '')
                .trim()
              if (!nonQResidue) return selector
            }

            return prefixedSelector
          },
        }),
      ]).process(code, { from: cleanId })

      return { code: result.css, map: null }
    },
  }
}
