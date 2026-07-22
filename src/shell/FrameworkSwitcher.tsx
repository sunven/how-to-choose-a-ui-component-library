import { NavLink } from 'react-router-dom'
import {
  FRAMEWORKS,
  libraryPath,
  type FrameworkId,
} from '@/domain/libraries'
import { targetLibraryForFramework } from '@/domain/frameworkMemory'
import { cn } from '@/lib/cn'

export function FrameworkSwitcher({ current }: { current: FrameworkId }) {
  return (
    <nav className="flex flex-wrap gap-2" aria-label="框架切换">
      {FRAMEWORKS.map((fw) => (
        <NavLink
          key={fw.id}
          to={libraryPath(fw.id, targetLibraryForFramework(fw.id))}
          className={() =>
            cn(
              'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
              current === fw.id
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50',
            )
          }
        >
          {fw.name}
        </NavLink>
      ))}
    </nav>
  )
}
