/**
 * @file themeStore.ts
 * @description 主题偏好（浅色 / 深色 / 跟随系统）
 */

import { create } from 'zustand'
import {
  applyResolvedTheme,
  loadStoredTheme,
  resolveTheme,
  THEME_STORAGE_KEY,
  type ThemeMode,
} from '../lib/theme'

interface ThemeState {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
}

export const useThemeStore = create<ThemeState>(set => ({
  mode: loadStoredTheme(),
  setMode: mode => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode)
    } catch {
      // ignore
    }
    applyResolvedTheme(resolveTheme(mode))
    set({ mode })
  },
}))
