import { useEffect, useState } from "react";
import type { Analytics } from "./analytics.ts";

export type ConsentStore = {
  read: () => Promise<boolean>;
  write: (enabled: boolean) => Promise<void>;
};

/** Consent defaults off until the person turns it on in settings. */
export function createMemoryConsentStore(initial = false): ConsentStore {
  let enabled = initial;
  return {
    read: async () => enabled,
    write: async (next) => {
      enabled = next;
    },
  };
}

export function useAnalyticsConsent(store: ConsentStore, analytics: Analytics): {
  ready: boolean;
  enabled: boolean;
  setConsent: (enabled: boolean) => Promise<void>;
} {
  const [ready, setReady] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let cancelled = false;
    store.read().then((value) => {
      if (cancelled) return;
      analytics.setConsent(value);
      setEnabled(value);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [analytics, store]);

  async function setConsent(value: boolean): Promise<void> {
    await store.write(value);
    analytics.setConsent(value);
    setEnabled(value);
  }

  return { ready, enabled, setConsent };
}
