import { lazy, Suspense, type ComponentType, useEffect } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import {
  defaultPath,
  getLibrary,
  isFrameworkId,
  isLibraryId,
  libraryPath,
  resolveRouteLibrary,
  type LibraryId,
  type ReactLibraryId,
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
}

const VANILLA_SHOWCASES: Record<VanillaLibraryId, ComponentType<ShowcaseProps>> = {
  daisyui: DaisyUiShowcase,
  bootstrap: BootstrapShowcase,
  bulma: BulmaShowcase,
}

export function LibraryPage() {
  const { framework, libraryId } = useParams()
  const users = useUsers()

  if (!isFrameworkId(framework) || !isLibraryId(libraryId)) {
    return <Navigate to={defaultPath()} replace />
  }

  const library = resolveRouteLibrary(framework, libraryId)
  if (library.framework !== framework || library.id !== libraryId) {
    return <Navigate to={libraryPath(library.framework, library.id)} replace />
  }

  return <LibraryPageBody libraryId={library.id} users={users} />
}

function LibraryPageBody({
  libraryId,
  users,
}: {
  libraryId: LibraryId
  users: ReturnType<typeof useUsers>
}) {
  const library = getLibrary(libraryId)

  // L1: track / unload global CSS injected while this library is active
  useLibraryStyleIsolation(libraryId)

  useEffect(() => {
    rememberLibrary(library.framework, library.id)
  }, [library.framework, library.id])

  const isVue = library.framework === 'vue'
  const isVanilla = library.framework === 'vanilla'
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
            <div className="flex h-48 items-center justify-center text-sm text-slate-500">
              加载 {library.name} Showcase…
            </div>
          }
        >
          {VueIsland ? (
            <VueIsland />
          ) : isVanilla ? (
            <VanillaShowcase libraryId={libraryId} users={users} />
          ) : (
            <ReactShowcase libraryId={libraryId} users={users} />
          )}
        </Suspense>
      </section>
      <LibraryProfileCard library={library} />
    </div>
  )
}

function ReactShowcase({
  libraryId,
  users,
}: {
  libraryId: LibraryId
  users: ReturnType<typeof useUsers>
}) {
  if (getLibrary(libraryId).framework !== 'react') return null
  const Showcase = REACT_SHOWCASES[libraryId as ReactLibraryId]
  return <Showcase users={users} />
}

function VanillaShowcase({
  libraryId,
  users,
}: {
  libraryId: LibraryId
  users: ReturnType<typeof useUsers>
}) {
  if (getLibrary(libraryId).framework !== 'vanilla') return null
  const Showcase = VANILLA_SHOWCASES[libraryId as VanillaLibraryId]
  return <Showcase users={users} />
}

/** Redirect v1 `/libs/:libraryId` → `/libs/:framework/:libraryId` by registry. */
export function LegacyLibraryRedirect() {
  const { libraryId } = useParams()
  if (isLibraryId(libraryId)) {
    const lib = getLibrary(libraryId)
    return <Navigate to={libraryPath(lib.framework, lib.id)} replace />
  }
  return <Navigate to={defaultPath()} replace />
}
