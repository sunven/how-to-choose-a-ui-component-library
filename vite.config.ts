import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import postcss from 'postcss'
import prefixSelector from 'postcss-prefix-selector'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

/**
 * Vuestic ships a full utility sheet (`.px-3`, `.flex>*`, etc.) that collides
 * with Tailwind on the App Shell. Scope *all* non-component selectors under
 * `.vuestic-island`. Leave pure `.va-*` component rules unscoped so teleported
 * modals still look correct.
 */
function scopeVuesticCss(): Plugin {
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
          prefix: '.vuestic-island',
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
                .replace(/:root\b/g, '.vuestic-island')
                .replace(/:host\b/g, '.vuestic-island')
                .replace(/\bbody\b/g, '.vuestic-island')
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
 * Scope non-component selectors under `.vuetify-island`. Keep pure `.v-*` component
 * rules global so teleported overlays (v-dialog / v-overlay) still style correctly.
 */
function scopeVuetifyCss(): Plugin {
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
          prefix: '.vuetify-island',
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
                .replace(/:root\b/g, '.vuetify-island')
                .replace(/\bhtml\b/g, '.vuetify-island')
                .replace(/\bbody\b/g, '.vuetify-island')
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

export default defineConfig({
  // Bootstrap/Bulma CSS is imported as ?raw and injected as scoped <style>
  // (see showcases/vanillaCss.ts) — never through this PostCSS/Tailwind pipeline,
  // which hung the build on those multi-hundred-KB stylesheets.
  plugins: [scopeVuesticCss(), scopeVuetifyCss(), vue(), react()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, 'src'),
      // Semi's package exports omit dist/css; alias so Vite can resolve the global stylesheet.
      '@douyinfe/semi-ui/dist/css/semi.min.css': path.resolve(
        rootDir,
        'node_modules/@douyinfe/semi-ui/dist/css/semi.min.css',
      ),
    },
  },
})
