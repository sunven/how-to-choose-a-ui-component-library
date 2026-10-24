import type { ComponentType } from 'react'
import { candidateLibraryCatalog, type VueLibraryId } from '@/domain/libraries'
import { librarySurfaces } from '@/showcases/librarySurfaces'
import { VueIslandHost, type VueShowcaseLoader } from './VueIslandHost'

interface VueShowcaseIslandOptions {
  libraryId: VueLibraryId
  load: VueShowcaseLoader
}

export function createVueShowcaseIsland({
  libraryId,
  load,
}: VueShowcaseIslandOptions): ComponentType {
  const libraryName =
    candidateLibraryCatalog.findCandidate(libraryId)?.profile.name ?? libraryId
  const rootClassName = librarySurfaces[libraryId].rootClassName

  const Island: ComponentType = () => (
    <VueIslandHost
      libraryName={libraryName}
      rootClassName={rootClassName}
      load={load}
    />
  )
  Island.displayName = `${libraryId}Island`

  return Island
}
