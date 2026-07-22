import { useEffect, useRef, useState } from 'react'
import type { App } from 'vue'

/** React host for Naive UI Vue Showcase island. */
export function NaiveUiIsland() {
  const hostRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const el = hostRef.current
    if (!el) return

    let disposed = false
    let app: App | null = null

    void import('./mount')
      .then(({ mountNaiveUiShowcase }) => {
        if (disposed) return
        app = mountNaiveUiShowcase(el)
      })
      .catch((e: unknown) => {
        if (!disposed) {
          setError(e instanceof Error ? e.message : '加载失败')
        }
      })

    return () => {
      disposed = true
      app?.unmount()
      el.replaceChildren()
    }
  }, [])

  if (error) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-red-600">
        Naive UI Showcase 加载失败：{error}
      </div>
    )
  }

  return <div ref={hostRef} className="naive-ui-island min-h-[12rem]" />
}
