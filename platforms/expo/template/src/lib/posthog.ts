import type { AnalyticsProperties, AnalyticsProvider } from "./analytics.ts";

/**
 * The subset of `posthog-react-native` this kit calls.
 * `capture` is PostHog's name for `track`.
 */
export type PostHogLike = {
  capture: (event: string, properties?: AnalyticsProperties) => void;
  identify: (distinctId: string, properties?: AnalyticsProperties) => void;
  reset: () => void;
  screen: (name: string, properties?: AnalyticsProperties) => void | Promise<void>;
  optIn: () => void | Promise<void>;
  optOut: () => void | Promise<void>;
};

export function bindPostHog(client: PostHogLike): AnalyticsProvider {
  return {
    capture: (event, properties) => client.capture(event, properties),
    identify: (distinctId, properties) => client.identify(distinctId, properties),
    reset: () => client.reset(),
    screen: (name, properties) => {
      void client.screen(name, properties);
    },
    optIn: () => {
      void client.optIn();
    },
    optOut: () => {
      void client.optOut();
    },
  };
}
