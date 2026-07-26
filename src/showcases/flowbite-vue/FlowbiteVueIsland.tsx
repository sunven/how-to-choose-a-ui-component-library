import {
  VueIslandHost,
  type VueShowcaseLoader,
} from '@/showcases/vue-island/VueIslandHost'

const loadFlowbiteVueShowcase: VueShowcaseLoader = () =>
  import('./mount').then(({ mountFlowbiteVueShowcase }) => mountFlowbiteVueShowcase)

export function FlowbiteVueIsland() {
  return (
    <VueIslandHost
      libraryName="Flowbite Vue"
      rootClassName="flowbite-vue-island"
      load={loadFlowbiteVueShowcase}
    />
  )
}
