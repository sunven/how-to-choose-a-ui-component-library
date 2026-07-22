import type { LibraryProfile } from '@/domain/libraries'
import { formatStars, useGitHubStars } from '@/features/profile/useGitHubStars'

export function LibraryProfileCard({ library }: { library: LibraryProfile }) {
  const { state, retry } = useGitHubStars(library.githubRepo, library.starsSnapshot)

  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{library.name}</h2>
          <p className="mt-1 text-sm text-slate-600">{library.tagline}</p>
        </div>
      </div>

      <dl className="space-y-2 text-sm">
        <Row label="适用框架" value={library.frameworks} />
        <div className="flex gap-2">
          <dt className="w-28 shrink-0 text-slate-500">GitHub stars</dt>
          <dd className="min-w-0 flex-1 text-slate-900">
            <span className="font-medium">{formatStars(state.stars)}</span>
            {state.status === 'loading' && (
              <span className="ml-2 text-xs text-slate-400">更新中…</span>
            )}
            {state.fromSnapshot && state.status !== 'loading' && (
              <span className="ml-2 text-xs text-amber-600">快照</span>
            )}
            {state.status === 'error' && (
              <button
                type="button"
                onClick={retry}
                className="ml-2 text-xs text-blue-600 underline-offset-2 hover:underline"
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
        <div className="flex gap-2 pt-1">
          <dt className="w-28 shrink-0 text-slate-500">链接</dt>
          <dd className="flex flex-wrap gap-3">
            <a
              className="text-blue-600 hover:underline"
              href={library.homepage}
              target="_blank"
              rel="noreferrer"
            >
              官网
            </a>
            <a
              className="text-blue-600 hover:underline"
              href={library.docs}
              target="_blank"
              rel="noreferrer"
            >
              文档
            </a>
            <a
              className="text-blue-600 hover:underline"
              href={`https://github.com/${library.githubRepo}`}
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </dd>
        </div>
      </dl>
    </aside>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-28 shrink-0 text-slate-500">{label}</dt>
      <dd className="min-w-0 flex-1 text-slate-900">{value}</dd>
    </div>
  )
}
