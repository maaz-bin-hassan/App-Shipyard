import { applyLayoutDirection, directionFor, type NativeLayout } from "./direction.ts";
import { bindTranslator, setLanguage, type Catalog } from "./translate.ts";

export type LocalizationLike = {
  getLocales: () => Array<{ languageTag?: string; languageCode?: string; textDirection?: "ltr" | "rtl" }>;
};

export type I18nextLike = {
  init: (options: Record<string, unknown>) => Promise<unknown>;
  t: (key: string, options?: { lng?: string }) => string;
};

/**
 * Wires i18next to the same catalogs as `translate`.
 * `directionFor` decides RTL. Urdu and Arabic stay RTL even when the device reports ltr.
 * Pass React Native's `I18nManager` as `native` when the app is running.
 */
export async function setupI18next(
  i18n: I18nextLike,
  localization: LocalizationLike,
  catalogs: Record<string, Catalog>,
  native?: NativeLayout,
): Promise<{ language: string; direction: "ltr" | "rtl" }> {
  const locale = localization.getLocales()[0];
  const tag = locale?.languageCode ?? locale?.languageTag ?? "en";
  const resources: Record<string, { translation: Catalog }> = {};
  for (const [code, catalog] of Object.entries(catalogs)) {
    resources[code] = { translation: catalog };
  }
  await i18n.init({
    resources,
    lng: tag,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });
  bindTranslator((key, language) => i18n.t(key, { lng: language }));
  setLanguage(tag);
  const direction = native ? applyLayoutDirection(tag, native) : directionFor(tag);
  return { language: tag, direction };
}
