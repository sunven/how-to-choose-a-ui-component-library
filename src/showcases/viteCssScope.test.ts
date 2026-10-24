import { describe, expect, it } from 'vitest'
import surfaces from './librarySurfaces.json'
import {
  scopeQuasarCss,
  scopeVuesticCss,
  scopeVuetifyCss,
} from './viteCssScope'

type CssScopePlugin = ReturnType<typeof scopeVuetifyCss>

async function transform(
  plugin: CssScopePlugin,
  css: string,
  id: string,
): Promise<string> {
  const hook = plugin.transform
  if (!hook || typeof hook !== 'function') {
    throw new Error('Expected a function transform hook')
  }

  const runTransform = hook as unknown as (
    code: string,
    id: string,
  ) => Promise<{ code: string } | null>
  const result = await runTransform(css, id)
  if (
    !result ||
    typeof result !== 'object' ||
    !('code' in result) ||
    typeof result.code !== 'string'
  ) {
    throw new Error('Expected CSS output')
  }

  return result.code
}

describe('Vite CSS scope plugins', () => {
  it('scopes Vuetify utilities under the Library Surface root', async () => {
    const code = await transform(
      scopeVuetifyCss(),
      '.bg-white { background: #fff !important; }\n.v-btn { color: red; }',
      '/project/node_modules/vuetify/lib/styles/main.css',
    )

    expect(code).toContain(`.${surfaces.vuetify.rootClassName} .bg-white`)
    expect(code).toContain('.v-btn')
  })

  it('scopes Vuestic utilities under the Library Surface root', async () => {
    const code = await transform(
      scopeVuesticCss(),
      '.px-3 { padding: 12px; }\n.va-button { color: red; }',
      '/project/node_modules/vuestic-ui/dist/vuestic-ui.css',
    )

    expect(code).toContain(`.${surfaces['vuestic-ui'].rootClassName} .px-3`)
    expect(code).toContain('.va-button')
  })

  it('scopes Quasar utilities under the Library Surface root', async () => {
    const code = await transform(
      scopeQuasarCss(),
      '.bg-white { background: #fff !important; }\n.q-btn { color: red; }',
      '/project/node_modules/quasar/dist/quasar.css',
    )

    expect(code).toContain(`.${surfaces.quasar.rootClassName} .bg-white`)
    expect(code).toContain('.q-btn')
  })
})
