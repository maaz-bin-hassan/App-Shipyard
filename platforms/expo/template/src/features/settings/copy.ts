import { translate } from "../../i18n/translate.ts";

export function consentCopy(language?: string) {
  return {
    title: translate("settings.consent.title", language),
    body: translate("settings.consent.body", language),
    on: translate("settings.consent.on", language),
    off: translate("settings.consent.off", language),
  };
}
