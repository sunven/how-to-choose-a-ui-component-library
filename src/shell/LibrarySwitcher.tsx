import { NavLink } from 'react-router-dom'
import {
  type CatalogFramework,
  type LibraryId,
} from '@/domain/libraries'
import { cn } from '@/lib/cn'

export function LibrarySwitcher({
  framework,
  currentLibraryId,
}: {
  framework: CatalogFramework
  currentLibraryId: LibraryId
}) {
  return (
    <nav className="flex flex-wrap gap-2" aria-label="组件库切换">
      {framework.candidates.map((candidate) => (
        <NavLink
          key={candidate.id}
          to={candidate.path}
          className={() =>
            cn(
              'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
              currentLibraryId === candidate.id
                ? 'border-slate-700 bg-slate-700 text-white dark:border-slate-200 dark:bg-slate-200 dark:text-slate-900'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-700',
            )
          }
        >
          {candidate.profile.name}
        </NavLink>
      ))}
    </nav>
  )
}
