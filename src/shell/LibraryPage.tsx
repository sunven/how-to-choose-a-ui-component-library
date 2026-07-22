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
} from '@/domain/libraries'
import { rememberLibrary } from '@/domain/frameworkMemory'
import { useUsers } from '@/domain/useUsers'
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
const ElementPlusIsland = lazy(() =>
  import('@/showcases/element-plus/ElementPlusIsland').then((m) => ({
    default: m.ElementPlusIsland,
  })),
)

const REACT_SHOWCASES: Record<
  Exclude<LibraryId, 'element-plus'>,
  ComponentType<ShowcaseProps>
> = {
  'ant-design': AntDesignShowcase,
  mui: MuiShowcase,
  shadcn: ShadcnShowcase,
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

  useEffect(() => {
    rememberLibrary(library.framework, library.id)
  }, [library.framework, library.id])

  const isVue = library.framework === 'vue'

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">用户管理 · Showcase</h2>
            <p className="text-sm text-slate-500">
              当前实现：{library.name}
              <span className="text-slate-400"> · {library.framework === 'react' ? 'React' : 'Vue'}</span>
            </p>
          </div>
        </div>
        <Suspense
          fallback={
            <div className="flex h-48 items-center justify-center text-sm text-slate-500">
              加载 {library.name} Showcase…
            </div>
          }
        >
          {isVue ? (
            <ElementPlusIsland />
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
  if (libraryId === 'element-plus') return null
  const Showcase = REACT_SHOWCASES[libraryId]
  return <Showcase users={users} />
}

/** Redirect v1 `/libs/:libraryId` → `/libs/react/:libraryId` when valid. */
export function LegacyLibraryRedirect() {
  const { libraryId } = useParams()
  if (isLibraryId(libraryId)) {
    const lib = getLibrary(libraryId)
    return <Navigate to={libraryPath(lib.framework, lib.id)} replace />
  }
  return <Navigate to={defaultPath()} replace />
}
