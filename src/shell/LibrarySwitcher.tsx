import { NavLink } from 'react-router-dom'
import {
  getLibrariesForFramework,
  libraryPath,
  type FrameworkId,
  type LibraryId,
} from '@/domain/libraries'
import { cn } from '@/lib/cn'

export function LibrarySwitcher({
  framework,
  currentLibraryId,
}: {
  framework: FrameworkId
  currentLibraryId: LibraryId
}) {
  const libs = getLibrariesForFramework(framework)

  return (
    <nav className="flex flex-wrap gap-2" aria-label="组件库切换">
      {libs.map((lib) => (
        <NavLink
          key={lib.id}
          to={libraryPath(framework, lib.id)}
          className={() =>
            cn(
              'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
              currentLibraryId === lib.id
                ? 'border-slate-700 bg-slate-700 text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50',
            )
          }
        >
          {lib.name}
        </NavLink>
      ))}
    </nav>
  )
}
