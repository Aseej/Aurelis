import { LanguageCatalogItem } from './types';

/**
 * AURELIS Language Catalog
 * Exclusively contains the 11 fully supported and tested languages
 * with complete native dictionaries and RTL support.
 */
export const LANGUAGE_CATALOG: LanguageCatalogItem[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    dir: 'ltr',
    status: 'fully_supported',
    script: 'Latin',
  },
  {
    code: 'ne',
    name: 'Nepali',
    nativeName: 'नेपाली',
    dir: 'ltr',
    status: 'fully_supported',
    script: 'Devanagari',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    dir: 'ltr',
    status: 'fully_supported',
    script: 'Devanagari',
  },
  {
    code: 'zh-Hans',
    name: 'Chinese, Simplified',
    nativeName: '简体中文',
    dir: 'ltr',
    status: 'fully_supported',
    script: 'Simplified Han',
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    dir: 'ltr',
    status: 'fully_supported',
    script: 'Latin',
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    dir: 'ltr',
    status: 'fully_supported',
    script: 'Latin',
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    dir: 'ltr',
    status: 'fully_supported',
    script: 'Latin',
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    dir: 'ltr',
    status: 'fully_supported',
    script: 'Japanese (Kanji & Kana)',
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    dir: 'rtl',
    status: 'fully_supported',
    script: 'Arabic',
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    dir: 'ltr',
    status: 'fully_supported',
    script: 'Cyrillic',
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    dir: 'ltr',
    status: 'fully_supported',
    script: 'Latin',
  },
];

export const FULLY_SUPPORTED_LANGUAGES = LANGUAGE_CATALOG;

/**
 * Retrieve catalog item metadata by code with graceful fallback to English.
 */
export const getLanguageItem = (code: string): LanguageCatalogItem => {
  return (
    LANGUAGE_CATALOG.find((item) => item.code === code) ||
    LANGUAGE_CATALOG[0]
  );
};
