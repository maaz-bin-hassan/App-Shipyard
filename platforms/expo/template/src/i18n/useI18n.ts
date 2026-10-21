import { useSyncExternalStore } from "react";
import { directionFor } from "./direction.ts";
import { getLanguage, subscribeLanguage, translate } from "./translate.ts";

export function useI18n(): {
  language: string;
  direction: "ltr" | "rtl";
  t: (key: string) => string;
} {
  const language = useSyncExternalStore(subscribeLanguage, getLanguage, getLanguage);
  return {
    language,
    direction: directionFor(language),
    t: (key: string) => translate(key, language),
  };
}
