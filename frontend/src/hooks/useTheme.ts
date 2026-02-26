import { useEffect, useState } from 'react'

import { THEME_STORAGE_KEY } from '../constants/storage'
import type { Theme } from '../types/ui'

const resolveInitialTheme = (): Theme => {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(resolveInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme((previous) => (previous === 'light' ? 'dark' : 'light'))
  }

  return {
    theme,
    toggleTheme,
  }
}