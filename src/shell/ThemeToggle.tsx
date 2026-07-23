import { useThemeModeControls } from '@/domain/useThemeMode'
import { cn } from '@/lib/cn'

export function ThemeToggle() {
  const { mode, toggle } = useThemeModeControls()
  const isDark = mode === 'dark'

  return (
    <button
      type="button"
      onClick={() => toggle()}
      className={cn(
        'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border transition-colors',
        'border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50',
        'dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-slate-500 dark:hover:bg-slate-700',
      )}
      aria-label={isDark ? '切换为亮色' : '切换为暗色'}
      title={isDark ? '切换为亮色' : '切换为暗色'}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 14.5A8.5 8.5 0 1 1 9.5 3a7 7 0 0 0 11.5 11.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}
