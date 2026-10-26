/**
 * AURELIS Internationalization (i18n) Engine
 * Highly scalable, lightweight, local-first localization core.
 * Supports dynamic locale switching, RTL layout detection, unicode scripts,
 * date/number formatting, and safe fallback cascades.
 */

import React, { createContext, useContext, useEffect, useMemo, useCallback } from 'react';
import { I18nContextType, LanguageCatalogItem, TranslationMap } from './types';
import { LANGUAGE_CATALOG, getLanguageItem } from './catalog';

import { en } from './locales/en';
import { ne } from './locales/ne';
import { hi } from './locales/hi';
import { zhHans } from './locales/zh-Hans';
import { es } from './locales/es';
import { fr } from './locales/fr';
import { de } from './locales/de';
import { ja } from './locales/ja';
import { ar } from './locales/ar';
import { ru } from './locales/ru';
import { pt } from './locales/pt';

// Dictionary registry for fully supported languages
const TRANSLATION_REGISTRY: Record<string, TranslationMap> = {
  en,
  ne,
  hi,
  'zh-Hans': zhHans,
  es,
  fr,
  de,
  ja,
  ar,
  ru,
  pt,
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  currentLanguage?: string;
  onLanguageChange?: (code: string) => void;
  children: React.ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({
  currentLanguage = 'en',
  onLanguageChange,
  children,
}) => {
  const languageItem = useMemo(() => {
    return getLanguageItem(currentLanguage);
  }, [currentLanguage]);

  const isRTL = languageItem.dir === 'rtl';

  // Synchronize document attributes with active language and direction
  useEffect(() => {
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    if (isRTL) {
      document.documentElement.classList.add('rtl-layout');
    } else {
      document.documentElement.classList.remove('rtl-layout');
    }
  }, [currentLanguage, isRTL]);

  // Set language callback
  const setLanguage = useCallback(
    (code: string) => {
      if (onLanguageChange) {
        onLanguageChange(code);
      }
    },
    [onLanguageChange]
  );

  // Translation lookup with fallback to English then to provided fallback
  const t = useCallback(
    (key: string, fallback?: string, params?: Record<string, string | number>): string => {
      const activeDict = TRANSLATION_REGISTRY[currentLanguage];
      let translated = activeDict ? activeDict[key] : undefined;

      // Safe fallback to English dictionary
      if (!translated) {
        translated = en[key];
      }

      // Safe fallback to parameter or key
      if (!translated) {
        translated = fallback !== undefined ? fallback : key;
      }

      // Replace interpolation placeholders e.g. {days}
      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          translated = translated!.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
        });
      }

      return translated;
    },
    [currentLanguage]
  );

  // Locale-aware Date Formatter using browser Intl
  const formatDate = useCallback(
    (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
      try {
        const d = typeof date === 'string' ? new Date(date + (date.length === 10 ? 'T00:00:00' : '')) : date;
        if (isNaN(d.getTime())) return String(date);
        return new Intl.DateTimeFormat(currentLanguage, options || { dateStyle: 'medium' }).format(d);
      } catch (err) {
        return String(date);
      }
    },
    [currentLanguage]
  );

  // Locale-aware Number Formatter using browser Intl
  const formatNumber = useCallback(
    (value: number, options?: Intl.NumberFormatOptions): string => {
      try {
        return new Intl.NumberFormat(currentLanguage, options).format(value);
      } catch (err) {
        return String(value);
      }
    },
    [currentLanguage]
  );

  // Locale-aware Relative Day helper (Today, Yesterday, Tomorrow)
  const formatRelativeDay = useCallback(
    (dateStr: string): string => {
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate()
      ).padStart(2, '0')}`;

      const yesterday = new Date(now.getTime() - 86400000);
      const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(yesterday.getDate()).padStart(2, '0')}`;

      const tomorrow = new Date(now.getTime() + 86400000);
      const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(tomorrow.getDate()).padStart(2, '0')}`;

      if (dateStr === todayStr) {
        return t('common.today', 'Today');
      }
      if (dateStr === yesterdayStr) {
        return t('common.yesterday', 'Yesterday');
      }
      if (dateStr === tomorrowStr) {
        return t('common.tomorrow', 'Tomorrow');
      }

      return formatDate(dateStr, { month: 'short', day: 'numeric' });
    },
    [t, formatDate]
  );

  const value: I18nContextType = useMemo(
    () => ({
      language: currentLanguage,
      languageItem,
      catalog: LANGUAGE_CATALOG,
      isRTL,
      setLanguage,
      t,
      formatDate,
      formatNumber,
      formatRelativeDay,
    }),
    [currentLanguage, languageItem, isRTL, setLanguage, t, formatDate, formatNumber, formatRelativeDay]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
