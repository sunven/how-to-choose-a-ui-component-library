import {
  type FrameworkId,
  type LibraryId,
  getFramework,
  getLibrary,
  isLibraryId,
} from './libraries'

/** Session-only last library per framework (not persisted). */
const lastByFramework = new Map<FrameworkId, LibraryId>()

export function rememberLibrary(framework: FrameworkId, libraryId: LibraryId): void {
  lastByFramework.set(framework, libraryId)
}

export function targetLibraryForFramework(framework: FrameworkId): LibraryId {
  const last = lastByFramework.get(framework)
  if (last && isLibraryId(last) && getLibrary(last).framework === framework) {
    return last
  }
  return getFramework(framework).defaultLibraryId
}
