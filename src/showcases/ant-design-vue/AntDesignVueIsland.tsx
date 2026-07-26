import {
  VueIslandHost,
  type VueShowcaseLoader,
} from '@/showcases/vue-island/VueIslandHost'

const loadAntDesignVueShowcase: VueShowcaseLoader = () =>
  import('./mount').then(({ mountAntDesignVueShowcase }) => mountAntDesignVueShowcase)

export function AntDesignVueIsland() {
  return (
    <VueIslandHost
      libraryName="Ant Design Vue"
      rootClassName="ant-design-vue-island"
      load={loadAntDesignVueShowcase}
    />
  )
}
