import { describe, expect, it } from 'vitest'
import { candidateLibraryCatalog } from '@/domain/libraries'
import { resolveShowcase, showcaseRegistry } from './showcaseRegistry'

describe('Showcase Registry', () => {
  const catalogIds = candidateLibraryCatalog.frameworks.flatMap((framework) =>
    framework.candidates.map((candidate) => candidate.id),
  )
  const registryIds = Object.keys(showcaseRegistry)

  it('registers exactly the Candidate Library Catalog ids', () => {
    expect([...registryIds].sort()).toEqual([...catalogIds].sort())
  })

  it('resolves every catalog id to a distinct Showcase', () => {
    for (const id of catalogIds) {
      expect(resolveShowcase(id)).toBe(showcaseRegistry[id].Showcase)
    }

    expect(new Set(Object.values(showcaseRegistry).map((entry) => entry.Showcase)).size).toBe(
      catalogIds.length,
    )
  })
})
