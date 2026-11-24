import { tr } from "./tr";

/**
 * Çok dil altyapısı. Şu an yalnızca Türkçe etkin.
 * İngilizce eklemek için: en.ts dosyasını tr.ts ile aynı yapıda oluşturun,
 * aşağıdaki sözlüğe ekleyin ve rotaları app/[lang]/ altına taşıyın.
 */
export const locales = ["tr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "tr";

const dictionaries = { tr } as const;

export type Dictionary = typeof tr;

export function getDictionary(locale: Locale = defaultLocale): Dictionary {
  return dictionaries[locale] ?? tr;
}

export const t = getDictionary();
