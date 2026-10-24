import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import type { LibraryId, VueLibraryId } from '@/domain/libraries'
import { useUsers } from '@/domain/useUsers'
import { createVueShowcaseIsland } from './vue-island/createVueShowcaseIsland'
import type { VueShowcaseLoader } from './vue-island/VueIslandHost'
import type { ShowcaseProps } from './types'

/** LibraryId → normalized Showcase. Catalog owns identity; this module owns rendering. */
export type ShowcaseRenderer = LazyExoticComponent<ComponentType>

export interface ShowcaseEntry {
  readonly Showcase: ShowcaseRenderer
}

function withUsers(Showcase: ComponentType<ShowcaseProps>): ComponentType {
  return function ShowcaseWithUsers() {
    const users = useUsers()
    return <Showcase users={users} />
  }
}

function lazyVueIsland(
  libraryId: VueLibraryId,
  rootClassName: string,
  load: VueShowcaseLoader,
): ShowcaseRenderer {
  return lazy(async () => ({
    default: createVueShowcaseIsland({ libraryId, rootClassName, load }),
  }))
}

const AntDesignShowcase = lazy(() =>
  import('./ant-design/AntDesignShowcase').then((module) => ({
    default: withUsers(module.AntDesignShowcase),
  })),
)
const MuiShowcase = lazy(() =>
  import('./mui/MuiShowcase').then((module) => ({
    default: withUsers(module.MuiShowcase),
  })),
)
const ShadcnShowcase = lazy(() =>
  import('./shadcn/ShadcnShowcase').then((module) => ({
    default: withUsers(module.ShadcnShowcase),
  })),
)
const ArcoDesignShowcase = lazy(() =>
  import('./arco-design/ArcoDesignShowcase').then((module) => ({
    default: withUsers(module.ArcoDesignShowcase),
  })),
)
const SemiDesignShowcase = lazy(() =>
  import('./semi-design/SemiDesignShowcase').then((module) => ({
    default: withUsers(module.SemiDesignShowcase),
  })),
)
const MantineShowcase = lazy(() =>
  import('./mantine/MantineShowcase').then((module) => ({
    default: withUsers(module.MantineShowcase),
  })),
)
const BaseUiShowcase = lazy(() =>
  import('./base-ui/BaseUiShowcase').then((module) => ({
    default: withUsers(module.BaseUiShowcase),
  })),
)
const ElementPlusIsland = lazyVueIsland('element-plus', 'element-plus-island', () =>
  import('./element-plus/mount').then((module) => module.mountElementPlusShowcase),
)
const NaiveUiIsland = lazyVueIsland('naive-ui', 'naive-ui-island', () =>
  import('./naive-ui/mount').then((module) => module.mountNaiveUiShowcase),
)
const AntDesignVueIsland = lazyVueIsland(
  'ant-design-vue',
  'ant-design-vue-island',
  () =>
    import('./ant-design-vue/mount').then(
      (module) => module.mountAntDesignVueShowcase,
    ),
)
const ArcoDesignVueIsland = lazyVueIsland(
  'arco-design-vue',
  'arco-design-vue-island',
  () =>
    import('./arco-design-vue/mount').then(
      (module) => module.mountArcoDesignVueShowcase,
    ),
)
const VuetifyIsland = lazyVueIsland('vuetify', 'vuetify-island', () =>
  import('./vuetify/mount').then((module) => module.mountVuetifyShowcase),
)
const PrimeVueIsland = lazyVueIsland('primevue', 'primevue-island', () =>
  import('./primevue/mount').then((module) => module.mountPrimeVueShowcase),
)
const ShadcnVueIsland = lazyVueIsland('shadcn-vue', 'shadcn-vue-island', () =>
  import('./shadcn-vue/mount').then((module) => module.mountShadcnVueShowcase),
)
const VuesticIsland = lazyVueIsland('vuestic-ui', 'vuestic-island', () =>
  import('./vuestic-ui/mount').then((module) => module.mountVuesticShowcase),
)
const FlowbiteVueIsland = lazyVueIsland(
  'flowbite-vue',
  'flowbite-vue-island',
  () =>
    import('./flowbite-vue/mount').then(
      (module) => module.mountFlowbiteVueShowcase,
    ),
)
const QuasarIsland = lazyVueIsland('quasar', 'quasar-island', () =>
  import('./quasar/mount').then((module) => module.mountQuasarShowcase),
)
const VoltUiIsland = lazyVueIsland('volt-ui', 'volt-island', () =>
  import('./volt-ui/mount').then((module) => module.mountVoltUiShowcase),
)
const RekaUiIsland = lazyVueIsland('reka-ui', 'reka-island', () =>
  import('./reka-ui/mount').then((module) => module.mountRekaUiShowcase),
)
const DaisyUiShowcase = lazy(() =>
  import('./daisyui/DaisyUiShowcase').then((module) => ({
    default: withUsers(module.DaisyUiShowcase),
  })),
)
const BootstrapShowcase = lazy(() =>
  import('./bootstrap/BootstrapShowcase').then((module) => ({
    default: withUsers(module.BootstrapShowcase),
  })),
)
const BulmaShowcase = lazy(() =>
  import('./bulma/BulmaShowcase').then((module) => ({
    default: withUsers(module.BulmaShowcase),
  })),
)

export const showcaseRegistry = {
  'ant-design': { Showcase: AntDesignShowcase },
  mui: { Showcase: MuiShowcase },
  shadcn: { Showcase: ShadcnShowcase },
  'arco-design': { Showcase: ArcoDesignShowcase },
  'semi-design': { Showcase: SemiDesignShowcase },
  mantine: { Showcase: MantineShowcase },
  'base-ui': { Showcase: BaseUiShowcase },
  'element-plus': { Showcase: ElementPlusIsland },
  'naive-ui': { Showcase: NaiveUiIsland },
  'ant-design-vue': { Showcase: AntDesignVueIsland },
  'arco-design-vue': { Showcase: ArcoDesignVueIsland },
  vuetify: { Showcase: VuetifyIsland },
  primevue: { Showcase: PrimeVueIsland },
  'shadcn-vue': { Showcase: ShadcnVueIsland },
  'vuestic-ui': { Showcase: VuesticIsland },
  'flowbite-vue': { Showcase: FlowbiteVueIsland },
  quasar: { Showcase: QuasarIsland },
  'volt-ui': { Showcase: VoltUiIsland },
  'reka-ui': { Showcase: RekaUiIsland },
  daisyui: { Showcase: DaisyUiShowcase },
  bootstrap: { Showcase: BootstrapShowcase },
  bulma: { Showcase: BulmaShowcase },
} satisfies Record<LibraryId, ShowcaseEntry>

export function resolveShowcase(id: LibraryId): ShowcaseRenderer {
  return showcaseRegistry[id].Showcase
}
