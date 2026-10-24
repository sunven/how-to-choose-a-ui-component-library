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
  toggle: () => ThemeMode
} {
  const mode = useThemeMode()
  return {
    mode,
    toggle: themeModeStore.toggle,
  }
}
