import type { VanillaLibraryId, VueLibraryId } from '@/domain/libraries'
import type { ThemeMode } from '@/domain/themeMode'
import surfaces from './librarySurfaces.json'

export type VueStyleStrategy = 'global-l1' | 'vite-prefix'
export type VanillaStyleStrategy = 'vanilla-scope' | 'tailwind-prefix'

export interface VueLibrarySurface {
  readonly rootClassName: string
  readonly styleStrategy: VueStyleStrategy
}

export interface VanillaLibrarySurface {
  readonly rootClassName: string
  readonly styleStrategy: VanillaStyleStrategy
  readonly themeAttr: string
}

export const librarySurfaces = surfaces as Record<VueLibraryId, VueLibrarySurface> &
  Record<VanillaLibraryId, VanillaLibrarySurface>

export function surfaceThemeAttributes(
  surface: VanillaLibrarySurface,
  mode: ThemeMode,
): Record<string, ThemeMode> {
  return { [surface.themeAttr]: mode }
}
