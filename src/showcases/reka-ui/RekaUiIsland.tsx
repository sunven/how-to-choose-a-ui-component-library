import {
  VueIslandHost,
  type VueShowcaseLoader,
} from '@/showcases/vue-island/VueIslandHost'

const loadRekaUiShowcase: VueShowcaseLoader = () =>
  import('./mount').then(({ mountRekaUiShowcase }) => mountRekaUiShowcase)

export function RekaUiIsland() {
  return (
    <VueIslandHost
      libraryName="Reka UI"
      rootClassName="reka-island"
      load={loadRekaUiShowcase}
    />
  )
}
