import {
  VueIslandHost,
  type VueShowcaseLoader,
} from '@/showcases/vue-island/VueIslandHost'

const loadVuetifyShowcase: VueShowcaseLoader = () =>
  import('./mount').then(({ mountVuetifyShowcase }) => mountVuetifyShowcase)

export function VuetifyIsland() {
  return (
    <VueIslandHost
      libraryName="Vuetify"
      rootClassName="vuetify-island"
      load={loadVuetifyShowcase}
    />
  )
}
