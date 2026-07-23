/** Full-site light/dark preference for shell + current Showcase (see CONTEXT Theme Mode). */

export type ThemeMode = 'light' | 'dark'

export const THEME_MODE_STORAGE_KEY = 'ui-chooser-theme-mode'

type Listener = () => void

const listeners = new Set<Listener>()

function readStored(): ThemeMode {
  try {
    const raw = localStorage.getItem(THEME_MODE_STORAGE_KEY)
    if (raw === 'dark' || raw === 'light') return raw
  } catch {
    /* private mode / blocked storage */
  }
  return 'light'
}

let mode: ThemeMode = typeof document !== 'undefined' ? readStored() : 'light'

function emit() {
  for (const listener of listeners) listener()
}

/** Apply DOM side effects for shell Tailwind + libs that key off html/body. */
export function applyThemeModeToDocument(next: ThemeMode): void {
  const root = document.documentElement
  if (next === 'dark') {
    root.classList.add('dark')
    root.style.colorScheme = 'dark'
    // Official Arco / Semi dark selectors target body attributes
    document.body.setAttribute('arco-theme', 'dark')
    document.body.setAttribute('theme-mode', 'dark')
  } else {
    root.classList.remove('dark')
    root.style.colorScheme = 'light'
    document.body.removeAttribute('arco-theme')
    document.body.removeAttribute('theme-mode')
  }
}

export const themeModeStore = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },

  getSnapshot(): ThemeMode {
    return mode
  },

  set(next: ThemeMode): void {
    if (next !== 'light' && next !== 'dark') return
    if (next === mode) {
      applyThemeModeToDocument(next)
      return
    }
    mode = next
    try {
      localStorage.setItem(THEME_MODE_STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
    applyThemeModeToDocument(next)
    emit()
  },

  toggle(): ThemeMode {
    const next: ThemeMode = mode === 'dark' ? 'light' : 'dark'
    themeModeStore.set(next)
    return next
  },

  /** Sync in-memory state from storage + DOM (call once at app boot). */
  hydrate(): ThemeMode {
    mode = readStored()
    applyThemeModeToDocument(mode)
    return mode
  },
}
