import { useEffect, useRef, useState } from 'react'
import type { App } from 'vue'

/**
 * React host that mounts the Element Plus Vue Showcase as an island.
 * Styles and Vue runtime load only via the async mount chunk.
 */
export function ElementPlusIsland() {
  const hostRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const el = hostRef.current
    if (!el) return

    let disposed = false
    let app: App | null = null

    void import('./mount')
      .then(({ mountElementPlusShowcase }) => {
        if (disposed) return
        app = mountElementPlusShowcase(el)
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
        Element Plus Showcase 加载失败：{error}
      </div>
    )
  }

  return <div ref={hostRef} className="element-plus-island min-h-[12rem]" />
}
