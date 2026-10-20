import type { CrashProvider } from "./analytics.ts";

/** The subset of `@sentry/react-native` this kit calls. */
export type SentryLike = {
  captureException: (error: unknown) => void;
  setUser: (user: { id: string } | null) => void;
  close?: () => Promise<void>;
};

/**
 * `enabled` follows the consent flag. Source map upload is configured in
 * the Expo config plugin, not here. See docs/analytics-setup.md.
 */
export function bindSentry(client: SentryLike, setEnabled: (enabled: boolean) => void): CrashProvider {
  return {
    captureException: (error) => client.captureException(error),
    setUser: (user) => client.setUser(user),
    setEnabled,
  };
}
