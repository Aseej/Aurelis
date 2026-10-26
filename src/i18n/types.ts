/**
 * AURELIS Internationalization & Localization Types
 */

export type TextDirection = 'ltr' | 'rtl';
export type LanguageSupportStatus = 'fully_supported' | 'in_progress';

export interface LanguageCatalogItem {
  code: string;
  name: string; // English name, e.g. "Nepali"
  nativeName: string; // Native script name, e.g. "नेपाली"
  dir: TextDirection;
  status: LanguageSupportStatus;
  script?: string; // Script family, e.g. "Devanagari", "Latin", "Arabic", "Han"
  region?: string;
}

export type TranslationMap = Record<string, string>;

export interface I18nContextType {
  language: string;
  languageItem: LanguageCatalogItem;
  catalog: LanguageCatalogItem[];
  isRTL: boolean;
  setLanguage: (code: string) => void;
  t: (key: string, fallback?: string, params?: Record<string, string | number>) => string;
  formatDate: (date: string | Date, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatRelativeDay: (dateStr: string) => string;
}
