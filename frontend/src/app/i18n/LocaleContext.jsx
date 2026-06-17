import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import en from './extra/en.json' with { type: 'json' };
import uk from './extra/uk.json' with { type: 'json' };
import de from './extra/de.json' with { type: 'json' };
import es from './extra/es.json' with { type: 'json' };

const STORAGE_KEY = 'uiLang';

export const DATE_LOCALE_MAP = {
  en: 'en-US',
  uk: 'uk-UA',
  de: 'de-DE',
  es: 'es-ES',
};

export function getDateLocale(locale) {
  return DATE_LOCALE_MAP[locale] ?? DATE_LOCALE_MAP.en;
}

export const LOCALE_PACKS = { en, uk, de, es };

export const SUPPORTED_LOCALES = [
  { id: 'en', labelKey: 'lang.en' },
  { id: 'uk', labelKey: 'lang.uk' },
  { id: 'de', labelKey: 'lang.de' },
  { id: 'es', labelKey: 'lang.es' },
];

const LocaleContext = createContext(null);

function detectBrowserLocale() {
  if (typeof navigator === 'undefined') return 'en';

  const raw = String(navigator.language || 'en').toLowerCase();
  if (raw.startsWith('uk') || raw === 'ua') return 'uk';
  if (raw.startsWith('de')) return 'de';
  if (raw.startsWith('es')) return 'es';
  return 'en';
}

function readStoredLocale() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && LOCALE_PACKS[stored]) return stored;
  } catch {
    /* ignore */
  }
  return detectBrowserLocale();
}

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(readStoredLocale);

  const pack = LOCALE_PACKS[locale] ?? LOCALE_PACKS.en;
  const fallback = LOCALE_PACKS.en;

  const setLocale = useCallback((next) => {
    if (!LOCALE_PACKS[next]) return;
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === 'uk' ? 'uk' : locale;
    document.title = pack['app.title'] ?? fallback['app.title'] ?? 'LinkUp';
  }, [locale, pack, fallback]);

  const t = useCallback(
    (key, fallbackText, vars = {}) => {
      let text = pack[key] ?? fallback[key] ?? fallbackText ?? key;
      Object.entries(vars).forEach(([name, value]) => {
        text = text.replace(new RegExp(`\\{${name}\\}`, 'g'), String(value));
      });
      return text;
    },
    [pack, fallback],
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, pack }),
    [locale, setLocale, t, pack],
  );

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useTranslation must be used within LocaleProvider');
  }
  return ctx;
}
