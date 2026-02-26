import { useMemo, useState } from 'react'

import { LOCALE_STORAGE_KEY } from '../constants/storage'
import { resolveDictionary, resolvePreferredLocale } from '../i18n'
import type { Locale } from '../i18n/types'

const resolveInitialLocale = (): Locale => {
  if (typeof window === 'undefined') {
    return 'en'
  }

  const savedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY)
  if (savedLocale === 'en' || savedLocale === 'ru') {
    return savedLocale
  }

  return resolvePreferredLocale()
}

export const useLocale = () => {
  const [locale, setLocaleState] = useState<Locale>(resolveInitialLocale)

  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale)

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale)
    }
  }

  const dictionary = useMemo(() => resolveDictionary(locale), [locale])

  return {
    locale,
    setLocale,
    dictionary,
  }
}