import { useEffect, useRef, useState } from 'react'
import { useThemeMode } from '@/domain/useThemeMode'

export type DisposeVueShowcase = () => void
export type MountVueShowcase = (element: HTMLElement) => DisposeVueShowcase
export type VueShowcaseLoader = () => Promise<MountVueShowcase>

interface VueIslandHostProps {
  libraryName: string
  rootClassName: string
  load: VueShowcaseLoader
}

export function VueIslandHost({
  libraryName,
  rootClassName,
  load,
}: VueIslandHostProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const mode = useThemeMode()

  useEffect(() => {
    const element = hostRef.current
    if (!element) return

    let disposed = false
    let disposeShowcase: DisposeVueShowcase | undefined
    setLoading(true)

    void load()
      .then((mount) => {
        if (disposed) return
        disposeShowcase = mount(element)
        setLoading(false)
      })
      .catch((reason: unknown) => {
        if (!disposed) {
          setError(reason instanceof Error ? reason.message : '加载失败')
        }
      })

    return () => {
      disposed = true
      disposeShowcase?.()
      element.replaceChildren()
    }
  }, [load, mode])

  if (error) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-red-600 dark:text-red-400">
        {libraryName} Showcase 加载失败：{error}
      </div>
    )
  }

  return (
    <>
      {loading ? (
        <div className="flex h-48 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
          加载 {libraryName} Showcase…
        </div>
      ) : null}
      <div
        ref={hostRef}
        className={`${rootClassName} min-h-[12rem]${loading ? ' hidden' : ''}`}
      />
    </>
  )
}
