import { useEffect } from 'react'
import { applyResolvedTheme, resolveTheme } from '@/lib/theme'
import { useThemeStore } from '@/stores/themeStore'

interface ThemeProviderProps {
  children: React.ReactNode
}

/** 将主题同步到 document.documentElement，并在跟随系统时监听系统偏好变化 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const mode = useThemeStore(state => state.mode)

  useEffect(() => {
    applyResolvedTheme(resolveTheme(mode))

    if (mode !== 'system') return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyResolvedTheme(resolveTheme('system'))
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [mode])

  return children
}
