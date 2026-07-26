import {
  VueIslandHost,
  type VueShowcaseLoader,
} from '@/showcases/vue-island/VueIslandHost'

const loadVoltUiShowcase: VueShowcaseLoader = () =>
  import('./mount').then(({ mountVoltUiShowcase }) => mountVoltUiShowcase)

export function VoltUiIsland() {
  return (
    <VueIslandHost
      libraryName="Volt UI"
      rootClassName="volt-island"
      load={loadVoltUiShowcase}
    />
  )
}
