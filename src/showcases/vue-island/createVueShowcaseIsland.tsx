import type { ComponentType } from 'react'
import { candidateLibraryCatalog, type VueLibraryId } from '@/domain/libraries'
import { VueIslandHost, type VueShowcaseLoader } from './VueIslandHost'

interface VueShowcaseIslandOptions {
  libraryId: VueLibraryId
  rootClassName: string
  load: VueShowcaseLoader
}

export function createVueShowcaseIsland({
  libraryId,
  rootClassName,
  load,
}: VueShowcaseIslandOptions): ComponentType {
  const libraryName =
    candidateLibraryCatalog.findCandidate(libraryId)?.profile.name ?? libraryId

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
