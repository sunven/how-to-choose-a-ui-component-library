import { NavLink } from 'react-router-dom'
import {
  candidateLibraryCatalog,
  type FrameworkId,
} from '@/domain/libraries'
import { targetLibraryForFramework } from '@/domain/frameworkMemory'
import { cn } from '@/lib/cn'

export function FrameworkSwitcher({ current }: { current: FrameworkId }) {
  return (
    <nav className="flex flex-wrap gap-2" aria-label="框架切换">
      {candidateLibraryCatalog.frameworks.map((framework) => {
        const target = targetLibraryForFramework(framework)
        return (
          <NavLink
            key={framework.id}
            to={target.path}
            className={() =>
              cn(
                'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
                current === framework.id
                  ? 'border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-700',
              )
            }
          >
            {framework.name}
          </NavLink>
        )
      })}
    </nav>
  )
}
