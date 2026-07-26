import {
  VueIslandHost,
  type VueShowcaseLoader,
} from '@/showcases/vue-island/VueIslandHost'

const loadNaiveUiShowcase: VueShowcaseLoader = () =>
  import('./mount').then(({ mountNaiveUiShowcase }) => mountNaiveUiShowcase)

export function NaiveUiIsland() {
  return (
    <VueIslandHost
      libraryName="Naive UI"
      rootClassName="naive-ui-island"
      load={loadNaiveUiShowcase}
    />
  )
}
