import { createElement, type ReactNode } from "react";
import { useI18n } from "../../i18n/useI18n.ts";
import { useAnalyticsConsent, type ConsentStore } from "../../lib/consent.ts";
import type { Analytics } from "../../lib/analytics.ts";
import { Pressable, Text, View } from "../../ui/host.ts";
import { consentCopy } from "./copy.ts";

export function AnalyticsConsentSetting(props: {
  store: ConsentStore;
  analytics: Analytics;
}): ReactNode {
  const consent = useAnalyticsConsent(props.store, props.analytics);
  const copy = consentCopy(useI18n().language);
  const label = consent.enabled ? copy.on : copy.off;

  return createElement(
    View,
    null,
    createElement(Text, null, copy.title),
    createElement(Text, null, copy.body),
    createElement(
      Pressable,
      {
        onPress: () => {
          if (!consent.ready) return;
          void consent.setConsent(!consent.enabled);
        },
        accessibilityLabel: copy.title,
      },
      createElement(Text, null, label),
    ),
  );
}
