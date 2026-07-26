import { Outlet, useParams } from 'react-router-dom'
import {
  candidateLibraryCatalog,
  type ResolvedLibraryRoute,
} from '@/domain/libraries'
import { FrameworkSwitcher } from './FrameworkSwitcher'
import { LibrarySwitcher } from './LibrarySwitcher'
import { ThemeToggle } from './ThemeToggle'

function useResolvedLibraryRoute(): ResolvedLibraryRoute {
  const { framework, libraryId, segment } = useParams()

  if (framework !== undefined || libraryId !== undefined) {
    return candidateLibraryCatalog.resolveRoute({ kind: 'pair', framework, candidate: libraryId })
  }

  if (segment !== undefined) {
    return candidateLibraryCatalog.resolveRoute({ kind: 'single', segment })
  }

  return candidateLibraryCatalog.resolveRoute({ kind: 'root' })
}

export function AppLayout() {
  const route = useResolvedLibraryRoute()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                How to choose a UI component library
              </p>
              <h1 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl dark:text-slate-50">
                同一业务形态，切换组件库看表单与表格
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                用于视觉与交互初筛，不替代可访问性、性能与工程集成验证。建议：选框架 →
                体验至少 3 个库 → 形成 1–3 个候选。
              </p>
            </div>
            <ThemeToggle />
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <p className="mb-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">框架</p>
              <FrameworkSwitcher current={route.framework.id} />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">组件库</p>
              <LibrarySwitcher
                framework={route.framework}
                currentLibraryId={route.candidate.id}
              />
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <Outlet context={route} />
      </main>
    </div>
  )
}
