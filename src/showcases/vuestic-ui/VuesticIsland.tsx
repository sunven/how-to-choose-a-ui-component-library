import {
  VueIslandHost,
  type VueShowcaseLoader,
} from '@/showcases/vue-island/VueIslandHost'

const loadVuesticShowcase: VueShowcaseLoader = () =>
  import('./mount').then(({ mountVuesticShowcase }) => mountVuesticShowcase)

export function VuesticIsland() {
  return (
    <VueIslandHost
      libraryName="Vuestic UI"
      rootClassName="vuestic-island"
      load={loadVuesticShowcase}
    />
  )
}
