import {
  VueIslandHost,
  type VueShowcaseLoader,
} from '@/showcases/vue-island/VueIslandHost'

const loadElementPlusShowcase: VueShowcaseLoader = () =>
  import('./mount').then(({ mountElementPlusShowcase }) => mountElementPlusShowcase)

export function ElementPlusIsland() {
  return (
    <VueIslandHost
      libraryName="Element Plus"
      rootClassName="element-plus-island"
      load={loadElementPlusShowcase}
    />
  )
}
