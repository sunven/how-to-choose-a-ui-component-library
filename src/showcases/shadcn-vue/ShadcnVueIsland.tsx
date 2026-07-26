import {
  VueIslandHost,
  type VueShowcaseLoader,
} from '@/showcases/vue-island/VueIslandHost'

const loadShadcnVueShowcase: VueShowcaseLoader = () =>
  import('./mount').then(({ mountShadcnVueShowcase }) => mountShadcnVueShowcase)

export function ShadcnVueIsland() {
  return (
    <VueIslandHost
      libraryName="shadcn-vue"
      rootClassName="shadcn-vue-island"
      load={loadShadcnVueShowcase}
    />
  )
}
