import { useEffect, useRef, useState } from 'react'
import type { App } from 'vue'
import { useThemeMode } from '@/domain/useThemeMode'

/** React host for Vuetify Showcase island. Remounts when Theme Mode changes. */
export function VuetifyIsland() {
  const hostRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const mode = useThemeMode()

  useEffect(() => {
    const el = hostRef.current
    if (!el) return

    let disposed = false
    let app: App | null = null

    void import('./mount')
      .then(({ mountVuetifyShowcase }) => {
        if (disposed) return
        app = mountVuetifyShowcase(el)
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
  }, [mode])

  if (error) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-red-600 dark:text-red-400">
        Vuetify Showcase 加载失败：{error}
      </div>
    )
  }

  return <div ref={hostRef} className="vuetify-island min-h-[12rem]" />
}
