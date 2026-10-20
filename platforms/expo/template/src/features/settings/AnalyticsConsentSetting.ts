import { createElement, type ReactNode } from "react";
import { useAnalyticsConsent, type ConsentStore } from "../../lib/consent.ts";
import type { Analytics } from "../../lib/analytics.ts";
import { Pressable, Text, View } from "../../ui/host.ts";
import { CONSENT_COPY } from "./copy.ts";

export function AnalyticsConsentSetting(props: {
  store: ConsentStore;
  analytics: Analytics;
}): ReactNode {
  const consent = useAnalyticsConsent(props.store, props.analytics);
  const label = consent.enabled ? CONSENT_COPY.on : CONSENT_COPY.off;

  return createElement(
    View,
    null,
    createElement(Text, null, CONSENT_COPY.title),
    createElement(Text, null, CONSENT_COPY.body),
    createElement(
      Pressable,
      {
        onPress: () => {
          if (!consent.ready) return;
          void consent.setConsent(!consent.enabled);
        },
        accessibilityLabel: CONSENT_COPY.title,
      },
      createElement(Text, null, label),
    ),
  );
}
