import { Outlet, useParams } from 'react-router-dom'
import {
  DEFAULT_FRAMEWORK_ID,
  DEFAULT_LIBRARY_ID,
  getLibrary,
  isFrameworkId,
  isLibraryId,
  resolveRouteLibrary,
  type FrameworkId,
  type LibraryId,
} from '@/domain/libraries'
import { FrameworkSwitcher } from './FrameworkSwitcher'
import { LibrarySwitcher } from './LibrarySwitcher'

function useActiveSelection(): { framework: FrameworkId; libraryId: LibraryId } {
  const { framework, libraryId } = useParams()

  if (isFrameworkId(framework)) {
    const lib = resolveRouteLibrary(framework, libraryId)
    return { framework: lib.framework, libraryId: lib.id }
  }

  // Legacy `/libs/:libraryId` or empty
  if (isLibraryId(libraryId)) {
    const lib = getLibrary(libraryId)
    return { framework: lib.framework, libraryId: lib.id }
  }

  return { framework: DEFAULT_FRAMEWORK_ID, libraryId: DEFAULT_LIBRARY_ID }
}

export function AppLayout() {
  const { framework, libraryId } = useActiveSelection()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              How to choose a UI component library
            </p>
            <h1 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">
              同一业务形态，切换组件库看表单与表格
            </h1>
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <p className="mb-1.5 text-xs font-medium text-slate-500">框架</p>
              <FrameworkSwitcher current={framework} />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-slate-500">组件库</p>
              <LibrarySwitcher framework={framework} currentLibraryId={libraryId} />
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
