import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import en from './en'
import fr from './fr'
import hy from './hy'
import logger from '../utils/logger'

export const LANGUAGES = ['en', 'fr', 'hy']
export const DEFAULT_LANGUAGE = 'en'
const STORAGE_KEY = 'cosmo_portfolio_lang'

const DICTIONARIES = { en, fr, hy }

const I18nContext = createContext(null)

function readStoredLanguage() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return LANGUAGES.includes(stored) ? stored : DEFAULT_LANGUAGE
  } catch (error) {
    return DEFAULT_LANGUAGE
  }
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(readStoredLanguage)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, lang)
    } catch (error) {
      logger.warn('I18n', 'Unable to persist language preference', error)
    }
  }, [lang])

  const setLang = (next) => {
    if (!LANGUAGES.includes(next)) return
    logger.info('I18n', 'Language changed', { from: lang, to: next })
    setLangState(next)
  }

  const value = useMemo(
    () => ({ lang, setLang, dictionary: DICTIONARIES[lang] }),
    [lang],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}
