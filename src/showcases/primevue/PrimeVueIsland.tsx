import {
  VueIslandHost,
  type VueShowcaseLoader,
} from '@/showcases/vue-island/VueIslandHost'

const loadPrimeVueShowcase: VueShowcaseLoader = () =>
  import('./mount').then(({ mountPrimeVueShowcase }) => mountPrimeVueShowcase)

export function PrimeVueIsland() {
  return (
    <VueIslandHost
      libraryName="PrimeVue"
      rootClassName="primevue-island"
      load={loadPrimeVueShowcase}
    />
  )
}
