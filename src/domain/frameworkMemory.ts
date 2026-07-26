import {
  type CandidateLibrary,
  type CatalogFramework,
  type FrameworkId,
} from './libraries'

/** Session-only last library per framework (not persisted). */
const lastByFramework = new Map<FrameworkId, CandidateLibrary>()

export function rememberLibrary(candidate: CandidateLibrary): void {
  lastByFramework.set(candidate.framework, candidate)
}

export function targetLibraryForFramework(framework: CatalogFramework): CandidateLibrary {
  const last = lastByFramework.get(framework.id)
  if (last?.framework === framework.id) {
    return last
  }
  return framework.defaultCandidate
}
