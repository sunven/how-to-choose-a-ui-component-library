import { useSyncExternalStore } from 'react'
import { themeModeStore, type ThemeMode } from './themeMode'

export function useThemeMode(): ThemeMode {
  return useSyncExternalStore(
    themeModeStore.subscribe,
    themeModeStore.getSnapshot,
    () => 'light',
  )
}

export function useThemeModeControls(): {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  toggle: () => ThemeMode
} {
  const mode = useThemeMode()
  return {
    mode,
    setMode: themeModeStore.set,
    toggle: themeModeStore.toggle,
  }
}
