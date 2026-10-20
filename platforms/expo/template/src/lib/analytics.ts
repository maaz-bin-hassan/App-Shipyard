import { isEventName, type EventName } from "./events.ts";

export type AnalyticsProperties = Record<string, string | number | boolean>;

/** Provider methods the wrapper needs. PostHog is one implementation. */
export type AnalyticsProvider = {
  capture: (event: string, properties?: AnalyticsProperties) => void;
  identify: (distinctId: string, properties?: AnalyticsProperties) => void;
  reset: () => void;
  screen: (name: string, properties?: AnalyticsProperties) => void;
  optIn: () => void;
  optOut: () => void;
};

/** Crash reporter methods the wrapper needs. Sentry is one implementation. */
export type CrashProvider = {
  captureException: (error: unknown) => void;
  setUser: (user: { id: string } | null) => void;
  setEnabled: (enabled: boolean) => void;
};

export type Analytics = {
  track: (event: EventName, properties?: AnalyticsProperties) => void;
  identify: (distinctId: string, properties?: AnalyticsProperties) => void;
  reset: () => void;
  screen: (name: string, properties?: AnalyticsProperties) => void;
  captureException: (error: unknown) => void;
  setConsent: (enabled: boolean) => void;
  getConsent: () => boolean;
};

export function createAnalytics(options: {
  provider?: AnalyticsProvider | null;
  crashes?: CrashProvider | null;
  consent?: boolean;
}): Analytics {
  let consent = options.consent ?? false;
  const provider = options.provider ?? null;
  const crashes = options.crashes ?? null;

  applyConsent(consent, provider, crashes);

  return {
    track(event, properties) {
      if (!consent) return;
      if (!isEventName(event)) {
        throw new Error(`Unknown analytics event: ${event}`);
      }
      provider?.capture(event, properties);
    },
    identify(distinctId, properties) {
      if (!consent || distinctId.trim() === "") return;
      provider?.identify(distinctId, properties);
    },
    reset() {
      provider?.reset();
      crashes?.setUser(null);
    },
    screen(name, properties) {
      if (!consent || name.trim() === "") return;
      provider?.screen(name, properties);
    },
    captureException(error) {
      if (!consent) return;
      crashes?.captureException(error);
    },
    setConsent(enabled) {
      consent = enabled;
      applyConsent(enabled, provider, crashes);
    },
    getConsent() {
      return consent;
    },
  };
}

function applyConsent(
  enabled: boolean,
  provider: AnalyticsProvider | null,
  crashes: CrashProvider | null,
): void {
  if (enabled) {
    provider?.optIn();
    crashes?.setEnabled(true);
    return;
  }
  provider?.optOut();
  crashes?.setEnabled(false);
}
