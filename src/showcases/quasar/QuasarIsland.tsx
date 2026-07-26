import {
  VueIslandHost,
  type VueShowcaseLoader,
} from '@/showcases/vue-island/VueIslandHost'

const loadQuasarShowcase: VueShowcaseLoader = () =>
  import('./mount').then(({ mountQuasarShowcase }) => mountQuasarShowcase)

export function QuasarIsland() {
  return (
    <VueIslandHost
      libraryName="Quasar"
      rootClassName="quasar-island"
      load={loadQuasarShowcase}
    />
  )
}
