import { describe, expect, it } from 'vitest'
import { candidateLibraryCatalog } from './libraries'

describe('Candidate Library Catalog', () => {
  it('exposes Frameworks and Candidate Libraries in the recorded Switcher order', () => {
    expect(
      candidateLibraryCatalog.frameworks.map((framework) => ({
        framework: framework.id,
        candidates: framework.candidates.map((candidate) => candidate.id),
      })),
    ).toEqual([
      {
        framework: 'react',
        candidates: ['ant-design', 'mui', 'shadcn', 'arco-design', 'semi-design', 'mantine'],
      },
      {
        framework: 'vue',
        candidates: [
          'element-plus',
          'naive-ui',
          'ant-design-vue',
          'arco-design-vue',
          'vuetify',
          'primevue',
          'shadcn-vue',
          'vuestic-ui',
          'flowbite-vue',
          'quasar',
          'volt-ui',
          'reka-ui',
        ],
      },
      {
        framework: 'vanilla',
        candidates: ['daisyui', 'bootstrap', 'bulma'],
      },
    ])
  })

  it('finds an exact Candidate Library without falling back for an unknown id', () => {
    expect(candidateLibraryCatalog.findCandidate('mui')).toMatchObject({
      id: 'mui',
      framework: 'react',
      path: '/libs/react/mui',
    })
    expect(candidateLibraryCatalog.findCandidate('not-a-library')).toBeUndefined()
  })

  it('resolves an exact Framework and Candidate Library pair without redirecting', () => {
    expect(
      candidateLibraryCatalog.resolveRoute({
        kind: 'pair',
        framework: 'vue',
        candidate: 'vuetify',
      }),
    ).toMatchObject({
      framework: { id: 'vue' },
      candidate: { id: 'vuetify', path: '/libs/vue/vuetify' },
      redirect: false,
      reason: 'exact',
    })
  })

  it.each([undefined, 'not-a-library', 'mui'])(
    'keeps a valid Framework when Candidate Library %s is not valid for it',
    (candidate) => {
      expect(
        candidateLibraryCatalog.resolveRoute({
          kind: 'pair',
          framework: 'vue',
          candidate,
        }),
      ).toMatchObject({
        framework: { id: 'vue' },
        candidate: { id: 'element-plus', path: '/libs/vue/element-plus' },
        redirect: true,
        reason: 'framework-default',
      })
    },
  )

  it('uses the site default when the Framework is unknown', () => {
    expect(
      candidateLibraryCatalog.resolveRoute({
        kind: 'pair',
        framework: 'svelte',
        candidate: 'mui',
      }),
    ).toMatchObject({
      framework: { id: 'react' },
      candidate: { id: 'ant-design', path: '/libs/react/ant-design' },
      redirect: true,
      reason: 'site-default',
    })
  })

  it.each([
    ['vue', 'vue', 'element-plus', 'framework-default'],
    ['mui', 'react', 'mui', 'legacy-candidate'],
    ['not-a-route', 'react', 'ant-design', 'site-default'],
  ] as const)(
    'interprets the single Library Route segment %s without caller-side guessing',
    (segment, framework, candidate, reason) => {
      expect(candidateLibraryCatalog.resolveRoute({ kind: 'single', segment })).toMatchObject({
        framework: { id: framework },
        candidate: { id: candidate },
        redirect: true,
        reason,
      })
    },
  )

  it('resolves the site root to the site default', () => {
    expect(candidateLibraryCatalog.resolveRoute({ kind: 'root' })).toMatchObject({
      framework: { id: 'react' },
      candidate: { id: 'ant-design', path: '/libs/react/ant-design' },
      redirect: true,
      reason: 'site-default',
    })
  })
})
