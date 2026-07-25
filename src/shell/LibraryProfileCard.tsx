import type { LibraryProfile } from '@/domain/libraries'
import { formatStars, useGitHubStars } from '@/features/profile/useGitHubStars'

export function LibraryProfileCard({ library }: { library: LibraryProfile }) {
  const { state, retry } = useGitHubStars(library.githubRepo, library.starsSnapshot)

  return (
    <aside className="ui-chooser-profile-panel">
      <div className="mb-3">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{library.name}</h2>
          <nav className="flex flex-wrap gap-x-3 gap-y-1 text-sm" aria-label="组件库链接">
            <a
              className="text-blue-600 hover:underline dark:text-blue-400"
              href={library.homepage}
              target="_blank"
              rel="noreferrer"
            >
              官网
            </a>
            <a
              className="text-blue-600 hover:underline dark:text-blue-400"
              href={library.docs}
              target="_blank"
              rel="noreferrer"
            >
              文档
            </a>
            <a
              className="text-blue-600 hover:underline dark:text-blue-400"
              href={`https://github.com/${library.githubRepo}`}
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </nav>
        </div>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{library.tagline}</p>
      </div>

      <dl className="space-y-2 text-sm">
        <Row label="适用框架" value={library.frameworks} />
        <div className="flex gap-2">
          <dt className="w-28 shrink-0 text-slate-500 dark:text-slate-400">GitHub stars</dt>
          <dd className="min-w-0 flex-1 text-slate-900 dark:text-slate-100">
            <span className="font-medium">{formatStars(state.stars)}</span>
            {state.status === 'loading' && (
              <span className="ml-2 text-xs text-slate-400">更新中…</span>
            )}
            {state.fromSnapshot && state.status !== 'loading' && (
              <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">快照</span>
            )}
            {state.status === 'error' && (
              <button
                type="button"
                onClick={retry}
                className="ml-2 text-xs text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
              >
                重试
              </button>
            )}
          </dd>
        </div>
        <Row label="License" value={library.license} />
        <Row label="TypeScript" value={library.typescript} />
        <Row label="样式方案" value={library.styling} />
        <Row label="包体积" value={library.bundleSize} />
        <Row label="活跃度" value={library.activity} />
      </dl>
    </aside>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-28 shrink-0 text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="min-w-0 flex-1 text-slate-900 dark:text-slate-100">{value}</dd>
    </div>
  )
}
