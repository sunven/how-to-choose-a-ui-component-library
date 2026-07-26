import {
  VueIslandHost,
  type VueShowcaseLoader,
} from '@/showcases/vue-island/VueIslandHost'

const loadArcoDesignVueShowcase: VueShowcaseLoader = () =>
  import('./mount').then(({ mountArcoDesignVueShowcase }) => mountArcoDesignVueShowcase)

export function ArcoDesignVueIsland() {
  return (
    <VueIslandHost
      libraryName="Arco Design Vue"
      rootClassName="arco-design-vue-island"
      load={loadArcoDesignVueShowcase}
    />
  )
}
