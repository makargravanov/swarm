import { enDictionary } from './en'
import { ruDictionary } from './ru'
import type { Dictionary, Locale } from './types'

export const resolvePreferredLocale = (): Locale => {
  if (typeof window === 'undefined') {
    return 'en'
  }

  const normalized = window.navigator.language.toLowerCase()
  return normalized.startsWith('ru') ? 'ru' : 'en'
}

export const resolveDictionary = (locale: Locale): Dictionary => {
  return locale === 'ru' ? ruDictionary : enDictionary
}