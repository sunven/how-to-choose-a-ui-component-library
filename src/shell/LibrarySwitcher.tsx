import { NavLink } from 'react-router-dom'
import { LIBRARIES } from '@/domain/libraries'
import { cn } from '@/lib/cn'

export function LibrarySwitcher() {
  return (
    <nav className="flex flex-wrap gap-2" aria-label="组件库切换">
      {LIBRARIES.map((lib) => (
        <NavLink
          key={lib.id}
          to={`/libs/${lib.id}`}
          className={({ isActive }) =>
            cn(
              'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
              isActive
                ? 'border-slate-900 bg-slate-900 text-white'
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
