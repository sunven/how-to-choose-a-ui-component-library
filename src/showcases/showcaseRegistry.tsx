import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import type { LibraryId } from '@/domain/libraries'
import { useUsers } from '@/domain/useUsers'
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
const ElementPlusIsland = lazy(() =>
  import('./element-plus/ElementPlusIsland').then((module) => ({
    default: module.ElementPlusIsland,
  })),
)
const NaiveUiIsland = lazy(() =>
  import('./naive-ui/NaiveUiIsland').then((module) => ({
    default: module.NaiveUiIsland,
  })),
)
const AntDesignVueIsland = lazy(() =>
  import('./ant-design-vue/AntDesignVueIsland').then((module) => ({
    default: module.AntDesignVueIsland,
  })),
)
const ArcoDesignVueIsland = lazy(() =>
  import('./arco-design-vue/ArcoDesignVueIsland').then((module) => ({
    default: module.ArcoDesignVueIsland,
  })),
)
const VuetifyIsland = lazy(() =>
  import('./vuetify/VuetifyIsland').then((module) => ({
    default: module.VuetifyIsland,
  })),
)
const PrimeVueIsland = lazy(() =>
  import('./primevue/PrimeVueIsland').then((module) => ({
    default: module.PrimeVueIsland,
  })),
)
const ShadcnVueIsland = lazy(() =>
  import('./shadcn-vue/ShadcnVueIsland').then((module) => ({
    default: module.ShadcnVueIsland,
  })),
)
const VuesticIsland = lazy(() =>
  import('./vuestic-ui/VuesticIsland').then((module) => ({
    default: module.VuesticIsland,
  })),
)
const FlowbiteVueIsland = lazy(() =>
  import('./flowbite-vue/FlowbiteVueIsland').then((module) => ({
    default: module.FlowbiteVueIsland,
  })),
)
const QuasarIsland = lazy(() =>
  import('./quasar/QuasarIsland').then((module) => ({
    default: module.QuasarIsland,
  })),
)
const VoltUiIsland = lazy(() =>
  import('./volt-ui/VoltUiIsland').then((module) => ({
    default: module.VoltUiIsland,
  })),
)
const RekaUiIsland = lazy(() =>
  import('./reka-ui/RekaUiIsland').then((module) => ({
    default: module.RekaUiIsland,
  })),
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
