import { lazy, Suspense, type ComponentType } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import {
  DEFAULT_LIBRARY_ID,
  getLibrary,
  isLibraryId,
  type LibraryId,
} from '@/domain/libraries'
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

const SHOWCASES: Record<LibraryId, ComponentType<ShowcaseProps>> = {
  'ant-design': AntDesignShowcase,
  mui: MuiShowcase,
  shadcn: ShadcnShowcase,
}

export function LibraryPage() {
  const { libraryId } = useParams()
  const users = useUsers()

  if (!isLibraryId(libraryId)) {
    return <Navigate to={`/libs/${DEFAULT_LIBRARY_ID}`} replace />
  }

  const library = getLibrary(libraryId)
  const Showcase = SHOWCASES[libraryId]

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">用户管理 · Showcase</h2>
            <p className="text-sm text-slate-500">当前实现：{library.name}</p>
          </div>
        </div>
        <Suspense
          fallback={
            <div className="flex h-48 items-center justify-center text-sm text-slate-500">
              加载 {library.name} Showcase…
            </div>
          }
        >
          <Showcase users={users} />
        </Suspense>
      </section>
      <LibraryProfileCard library={library} />
    </div>
  )
}
