import { Suspense, useEffect } from 'react'
import { Navigate, useOutletContext } from 'react-router-dom'
import { type CandidateLibrary, type ResolvedLibraryRoute } from '@/domain/libraries'
import { rememberLibrary } from '@/domain/frameworkMemory'
import { resolveShowcase } from '@/showcases/showcaseRegistry'
import { useLibraryStyleIsolation } from '@/showcases/styleIsolation'
import { LibraryProfileCard } from './LibraryProfileCard'

export function LibraryPage() {
  const route = useOutletContext<ResolvedLibraryRoute>()

  if (route.redirect) {
    return <Navigate to={route.candidate.path} replace />
  }

  return <LibraryPageBody candidate={route.candidate} />
}

function LibraryPageBody({ candidate }: { candidate: CandidateLibrary }) {
  const libraryId = candidate.id
  const library = candidate.profile

  // L1: track / unload global CSS injected while this library is active
  useLibraryStyleIsolation(libraryId)

  useEffect(() => {
    rememberLibrary(candidate)
  }, [candidate])

  const Showcase = resolveShowcase(libraryId)

  // Layout uses dedicated class names (not Tailwind gap/grid utilities) so Bootstrap
  // !important spacing utilities cannot change the showcase vs profile column ratio.
  // Panel title ("用户管理 · Showcase / 当前实现") is omitted — framework + library are
  // already shown in the shell switchers and profile card.
  return (
    <div className="ui-chooser-library-layout">
      <section className="ui-chooser-showcase-panel">
        <Suspense
          fallback={
            <div className="flex h-48 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
              加载 {library.name} Showcase…
            </div>
          }
        >
          <Showcase key={libraryId} />
        </Suspense>
      </section>
      <LibraryProfileCard library={library} />
    </div>
  )
}

export function LibraryRouteRedirect() {
  const route = useOutletContext<ResolvedLibraryRoute>()
  return <Navigate to={route.candidate.path} replace />
}
