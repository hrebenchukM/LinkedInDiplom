import extraEn from "./extra/en.json" with { type: "json" };
import extraUk from "./extra/uk.json" with { type: "json" };
import extraEs from "./extra/es.json" with { type: "json" };
import extraDe from "./extra/de.json" with { type: "json" };

export function mergeDict(base) {
  return {
    en: { ...base.en, ...extraEn },
    uk: { ...base.uk, ...extraUk },
    es: { ...base.es, ...extraEs },
    de: { ...base.de, ...extraDe },
  };
}

export function resolveT(pack, fallbackPack, key, fallback) {
  return pack?.[key] ?? fallbackPack?.[key] ?? fallback ?? key;
}
