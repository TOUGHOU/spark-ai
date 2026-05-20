import { Monitor, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { resolveTheme, type ThemeMode } from '@/lib/theme'
import { useThemeStore } from '@/stores/themeStore'

const themeOptions: {
  value: ThemeMode
  label: string
  icon: typeof Sun
}[] = [
  { value: 'light', label: '浅色', icon: Sun },
  { value: 'dark', label: '深色', icon: Moon },
  { value: 'system', label: '跟随系统', icon: Monitor },
]

export function ThemeToggle() {
  const mode = useThemeStore(state => state.mode)
  const setMode = useThemeStore(state => state.setMode)
  const resolved = resolveTheme(mode)
  const ActiveIcon =
    themeOptions.find(option => option.value === mode)?.icon ??
    (resolved === 'dark' ? Moon : Sun)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" size="icon">
          <ActiveIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-40">
        <DropdownMenuRadioGroup
          value={mode}
          onValueChange={value => setMode(value as ThemeMode)}
        >
          {themeOptions.map(({ value, label, icon: Icon }) => (
            <DropdownMenuRadioItem key={value} value={value}>
              <Icon className="size-4" />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
