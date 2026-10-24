import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { candidateLibraryCatalog, type VanillaLibraryId } from '@/domain/libraries'
import { librarySurfaces } from './librarySurfaces'

const candidates = candidateLibraryCatalog.frameworks.flatMap(
  (framework) => framework.candidates,
)
const surfaceIds = candidates
  .filter((candidate) => candidate.framework !== 'react')
  .map((candidate) => candidate.id)
  .sort()
const vanillaIds = candidates.flatMap((candidate) =>
  candidate.framework === 'vanilla' ? [candidate.id as VanillaLibraryId] : [],
)

describe('Library Surface manifest', () => {
  it('covers exactly the Vue and Vanilla Candidate Libraries', () => {
    expect(Object.keys(librarySurfaces).sort()).toEqual(surfaceIds)
  })

  it('uses a unique, non-empty root class for every surface', () => {
    const roots = Object.values(librarySurfaces).map(
      (surface) => surface.rootClassName,
    )
    expect(roots.every(Boolean)).toBe(true)
    expect(new Set(roots).size).toBe(roots.length)
  })

  it('declares a valid strategy and a theme attribute for Vanilla surfaces', () => {
    const strategies = [
      'global-l1',
      'vite-prefix',
      'vanilla-scope',
      'tailwind-prefix',
    ]
    for (const surface of Object.values(librarySurfaces)) {
      expect(strategies).toContain(surface.styleStrategy)
    }
    for (const id of vanillaIds) {
      expect(librarySurfaces[id].themeAttr).toBeTruthy()
    }
  })

  it('matches the generated Vanilla @scope wrappers', () => {
    for (const [id, file] of [
      ['bootstrap', 'bootstrap.scoped.css'],
      ['bulma', 'bulma.scoped.css'],
    ] as const) {
      const css = readFileSync(resolve(`src/showcases/${id}/${file}`), 'utf8')
      expect(css).toContain(`@scope (.${librarySurfaces[id].rootClassName})`)
    }
  })

  it('matches the shell CSS for Vanilla surfaces', () => {
    const css = readFileSync(resolve('src/styles/index.css'), 'utf8')
    for (const id of ['bootstrap', 'bulma', 'daisyui'] as const) {
      expect(css).toContain(`.${librarySurfaces[id].rootClassName}`)
    }
  })
})
