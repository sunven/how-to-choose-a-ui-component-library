import { lazy, Suspense, type ComponentType, useEffect } from 'react'
import { Navigate, useOutletContext } from 'react-router-dom'
import {
  type CandidateLibrary,
  type ReactLibraryId,
  type ResolvedLibraryRoute,
  type VanillaLibraryId,
  type VueLibraryId,
} from '@/domain/libraries'
import { rememberLibrary } from '@/domain/frameworkMemory'
import { useUsers } from '@/domain/useUsers'
import { useLibraryStyleIsolation } from '@/showcases/styleIsolation'
import type { ShowcaseProps } from '@/showcases/types'
import { LibraryProfileCard } from './LibraryProfileCard'

const AntDesignShowcase = lazy(() =>
  import('@/showcases/ant-design/AntDesignShowcase').then((m) => ({
    default: m.AntDesignShowcase,
  })),
)
const MuiShowcase = lazy(() =>
  import('@/showcases/mui/MuiShowcase').then((m) => ({ default: m.MuiShowcase })),
)
const ShadcnShowcase = lazy(() =>
  import('@/showcases/shadcn/ShadcnShowcase').then((m) => ({ default: m.ShadcnShowcase })),
)
const ArcoDesignShowcase = lazy(() =>
  import('@/showcases/arco-design/ArcoDesignShowcase').then((m) => ({
    default: m.ArcoDesignShowcase,
  })),
)
const SemiDesignShowcase = lazy(() =>
  import('@/showcases/semi-design/SemiDesignShowcase').then((m) => ({
    default: m.SemiDesignShowcase,
  })),
)
const MantineShowcase = lazy(() =>
  import('@/showcases/mantine/MantineShowcase').then((m) => ({ default: m.MantineShowcase })),
)
const ElementPlusIsland = lazy(() =>
  import('@/showcases/element-plus/ElementPlusIsland').then((m) => ({
    default: m.ElementPlusIsland,
  })),
)
const NaiveUiIsland = lazy(() =>
  import('@/showcases/naive-ui/NaiveUiIsland').then((m) => ({ default: m.NaiveUiIsland })),
)
const AntDesignVueIsland = lazy(() =>
  import('@/showcases/ant-design-vue/AntDesignVueIsland').then((m) => ({
    default: m.AntDesignVueIsland,
  })),
)
const ArcoDesignVueIsland = lazy(() =>
  import('@/showcases/arco-design-vue/ArcoDesignVueIsland').then((m) => ({
    default: m.ArcoDesignVueIsland,
  })),
)
const VuetifyIsland = lazy(() =>
  import('@/showcases/vuetify/VuetifyIsland').then((m) => ({ default: m.VuetifyIsland })),
)
const PrimeVueIsland = lazy(() =>
  import('@/showcases/primevue/PrimeVueIsland').then((m) => ({ default: m.PrimeVueIsland })),
)
const ShadcnVueIsland = lazy(() =>
  import('@/showcases/shadcn-vue/ShadcnVueIsland').then((m) => ({ default: m.ShadcnVueIsland })),
)
const VuesticIsland = lazy(() =>
  import('@/showcases/vuestic-ui/VuesticIsland').then((m) => ({ default: m.VuesticIsland })),
)
const FlowbiteVueIsland = lazy(() =>
  import('@/showcases/flowbite-vue/FlowbiteVueIsland').then((m) => ({
    default: m.FlowbiteVueIsland,
  })),
)
const QuasarIsland = lazy(() =>
  import('@/showcases/quasar/QuasarIsland').then((m) => ({ default: m.QuasarIsland })),
)
const VoltUiIsland = lazy(() =>
  import('@/showcases/volt-ui/VoltUiIsland').then((m) => ({ default: m.VoltUiIsland })),
)
const RekaUiIsland = lazy(() =>
  import('@/showcases/reka-ui/RekaUiIsland').then((m) => ({ default: m.RekaUiIsland })),
)
const DaisyUiShowcase = lazy(() =>
  import('@/showcases/daisyui/DaisyUiShowcase').then((m) => ({ default: m.DaisyUiShowcase })),
)
const BootstrapShowcase = lazy(() =>
  import('@/showcases/bootstrap/BootstrapShowcase').then((m) => ({
    default: m.BootstrapShowcase,
  })),
)
const BulmaShowcase = lazy(() =>
  import('@/showcases/bulma/BulmaShowcase').then((m) => ({ default: m.BulmaShowcase })),
)

const REACT_SHOWCASES: Record<ReactLibraryId, ComponentType<ShowcaseProps>> = {
  'ant-design': AntDesignShowcase,
  mui: MuiShowcase,
  shadcn: ShadcnShowcase,
  'arco-design': ArcoDesignShowcase,
  'semi-design': SemiDesignShowcase,
  mantine: MantineShowcase,
}

const VUE_ISLANDS: Record<VueLibraryId, ComponentType> = {
  'element-plus': ElementPlusIsland,
  'naive-ui': NaiveUiIsland,
  'ant-design-vue': AntDesignVueIsland,
  'arco-design-vue': ArcoDesignVueIsland,
  vuetify: VuetifyIsland,
  primevue: PrimeVueIsland,
  'shadcn-vue': ShadcnVueIsland,
  'vuestic-ui': VuesticIsland,
  'flowbite-vue': FlowbiteVueIsland,
  quasar: QuasarIsland,
  'volt-ui': VoltUiIsland,
  'reka-ui': RekaUiIsland,
}

const VANILLA_SHOWCASES: Record<VanillaLibraryId, ComponentType<ShowcaseProps>> = {
  daisyui: DaisyUiShowcase,
  bootstrap: BootstrapShowcase,
  bulma: BulmaShowcase,
}

export function LibraryPage() {
  const route = useOutletContext<ResolvedLibraryRoute>()

  if (route.redirect) {
    return <Navigate to={route.candidate.path} replace />
  }

  return <LibraryPageBody candidate={route.candidate} />
}

function LibraryPageBody({ candidate }: { candidate: CandidateLibrary }) {
  const libraryId = candidate.id
  const library = candidate.profile

  // L1: track / unload global CSS injected while this library is active
  useLibraryStyleIsolation(libraryId)

  useEffect(() => {
    rememberLibrary(candidate)
  }, [candidate])

  const isVue = candidate.framework === 'vue'
  const isVanilla = candidate.framework === 'vanilla'
  const VueIsland = isVue ? VUE_ISLANDS[libraryId as VueLibraryId] : null

  // Layout uses dedicated class names (not Tailwind gap/grid utilities) so Bootstrap
  // !important spacing utilities cannot change the showcase vs profile column ratio.
  // Panel title ("用户管理 · Showcase / 当前实现") is omitted — framework + library are
  // already shown in the shell switchers and profile card.
  return (
    <div className="ui-chooser-library-layout">
      <section className="ui-chooser-showcase-panel">
        <Suspense
          fallback={
            <div className="flex h-48 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
              加载 {library.name} Showcase…
            </div>
          }
        >
          {VueIsland ? (
            <VueIsland key={libraryId} />
          ) : isVanilla ? (
            <VanillaShowcase key={libraryId} candidate={candidate} />
          ) : (
            <ReactShowcase key={libraryId} candidate={candidate} />
          )}
        </Suspense>
      </section>
      <LibraryProfileCard library={library} />
    </div>
  )
}

function ReactShowcase({ candidate }: { candidate: CandidateLibrary }) {
  const users = useUsers()
  if (candidate.framework !== 'react') return null
  const Showcase = REACT_SHOWCASES[candidate.id as ReactLibraryId]
  return <Showcase users={users} />
}

function VanillaShowcase({ candidate }: { candidate: CandidateLibrary }) {
  const users = useUsers()
  if (candidate.framework !== 'vanilla') return null
  const Showcase = VANILLA_SHOWCASES[candidate.id as VanillaLibraryId]
  return <Showcase users={users} />
}

export function LibraryRouteRedirect() {
  const route = useOutletContext<ResolvedLibraryRoute>()
  return <Navigate to={route.candidate.path} replace />
}
