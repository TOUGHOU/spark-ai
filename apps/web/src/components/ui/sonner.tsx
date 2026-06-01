import { Toaster as Sonner, type ToasterProps } from 'sonner'
import { resolveTheme } from '@/lib/theme'
import { useThemeStore } from '@/stores/themeStore'

export function Toaster({ ...props }: ToasterProps) {
  const mode = useThemeStore(state => state.mode)
  const theme = resolveTheme(mode)

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      position="top-center"
      richColors
      closeButton
      {...props}
    />
  )
}
