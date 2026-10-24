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

function lazyReactShowcase(
  load: () => Promise<ComponentType<ShowcaseProps>>,
): ShowcaseRenderer {
  return lazy(async () => ({ default: withUsers(await load()) }))
}

function lazyVueIsland(
  libraryId: VueLibraryId,
  load: VueShowcaseLoader,
): ShowcaseRenderer {
  return lazy(async () => ({
    default: createVueShowcaseIsland({ libraryId, load }),
  }))
}

const AntDesignShowcase = lazyReactShowcase(() =>
  import('./ant-design/AntDesignShowcase').then((module) => module.AntDesignShowcase),
)
const MuiShowcase = lazyReactShowcase(() =>
  import('./mui/MuiShowcase').then((module) => module.MuiShowcase),
)
const ShadcnShowcase = lazyReactShowcase(() =>
  import('./shadcn/ShadcnShowcase').then((module) => module.ShadcnShowcase),
)
const ArcoDesignShowcase = lazyReactShowcase(() =>
  import('./arco-design/ArcoDesignShowcase').then((module) => module.ArcoDesignShowcase),
)
const SemiDesignShowcase = lazyReactShowcase(() =>
  import('./semi-design/SemiDesignShowcase').then((module) => module.SemiDesignShowcase),
)
const MantineShowcase = lazyReactShowcase(() =>
  import('./mantine/MantineShowcase').then((module) => module.MantineShowcase),
)
const BaseUiShowcase = lazyReactShowcase(() =>
  import('./base-ui/BaseUiShowcase').then((module) => module.BaseUiShowcase),
)
const ElementPlusIsland = lazyVueIsland('element-plus', () =>
  import('./element-plus/mount').then((module) => module.mountElementPlusShowcase),
)
const NaiveUiIsland = lazyVueIsland('naive-ui', () =>
  import('./naive-ui/mount').then((module) => module.mountNaiveUiShowcase),
)
const AntDesignVueIsland = lazyVueIsland('ant-design-vue', () =>
  import('./ant-design-vue/mount').then(
    (module) => module.mountAntDesignVueShowcase,
  ),
)
const ArcoDesignVueIsland = lazyVueIsland('arco-design-vue', () =>
  import('./arco-design-vue/mount').then(
    (module) => module.mountArcoDesignVueShowcase,
  ),
)
const VuetifyIsland = lazyVueIsland('vuetify', () =>
  import('./vuetify/mount').then((module) => module.mountVuetifyShowcase),
)
const PrimeVueIsland = lazyVueIsland('primevue', () =>
  import('./primevue/mount').then((module) => module.mountPrimeVueShowcase),
)
const ShadcnVueIsland = lazyVueIsland('shadcn-vue', () =>
  import('./shadcn-vue/mount').then((module) => module.mountShadcnVueShowcase),
)
const VuesticIsland = lazyVueIsland('vuestic-ui', () =>
  import('./vuestic-ui/mount').then((module) => module.mountVuesticShowcase),
)
const FlowbiteVueIsland = lazyVueIsland('flowbite-vue', () =>
  import('./flowbite-vue/mount').then(
    (module) => module.mountFlowbiteVueShowcase,
  ),
)
const QuasarIsland = lazyVueIsland('quasar', () =>
  import('./quasar/mount').then((module) => module.mountQuasarShowcase),
)
const VoltUiIsland = lazyVueIsland('volt-ui', () =>
  import('./volt-ui/mount').then((module) => module.mountVoltUiShowcase),
)
const RekaUiIsland = lazyVueIsland('reka-ui', () =>
  import('./reka-ui/mount').then((module) => module.mountRekaUiShowcase),
)
const DaisyUiShowcase = lazyReactShowcase(() =>
  import('./daisyui/DaisyUiShowcase').then((module) => module.DaisyUiShowcase),
)
const BootstrapShowcase = lazyReactShowcase(() =>
  import('./bootstrap/BootstrapShowcase').then((module) => module.BootstrapShowcase),
)
const BulmaShowcase = lazyReactShowcase(() =>
  import('./bulma/BulmaShowcase').then((module) => module.BulmaShowcase),
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
