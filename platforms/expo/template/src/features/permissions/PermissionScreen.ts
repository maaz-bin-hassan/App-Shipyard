import { createElement, type ReactNode } from "react";
import { Pressable, Text, View } from "../../ui/host.ts";
import type { PermissionClient, PermissionKind } from "./types.ts";
import { usePermissionFlow, type PermissionTracker } from "./usePermissionFlow.ts";

export function PermissionScreen(props: {
  kind: PermissionKind;
  client: PermissionClient;
  locale?: string;
  analytics?: PermissionTracker;
}): ReactNode {
  const flow = usePermissionFlow(props.kind, props.client, {
    locale: props.locale,
    analytics: props.analytics,
  });

  if (flow.phase === "loading") {
    return createElement(View, null, createElement(Text, null, flow.copy.checking));
  }

  if (flow.phase === "granted" || flow.phase === "deferred") return null;

  if (flow.phase === "error") {
    return createElement(View, null, createElement(Text, null, flow.errorMessage ?? "Could not check this permission."));
  }

  if (flow.phase === "settings") {
    return createElement(
      View,
      null,
      createElement(Text, null, flow.copy.deniedTitle),
      createElement(Text, null, flow.copy.deniedBody),
      createElement(
        Pressable,
        {
          onPress: () => {
            void flow.openSettings();
          },
          accessibilityLabel: flow.copy.openSettings,
        },
        createElement(Text, null, flow.copy.openSettings),
      ),
      createElement(
        Pressable,
        { onPress: flow.notNow, accessibilityLabel: flow.copy.notNow },
        createElement(Text, null, flow.copy.notNow),
      ),
    );
  }

  return createElement(
    View,
    null,
    createElement(Text, null, flow.copy.title),
    createElement(Text, null, flow.copy.body),
    createElement(
      Pressable,
      {
        onPress: () => {
          void flow.allow();
        },
        accessibilityLabel: flow.copy.allow,
      },
      createElement(Text, null, flow.copy.allow),
    ),
    createElement(
      Pressable,
      { onPress: flow.notNow, accessibilityLabel: flow.copy.notNow },
      createElement(Text, null, flow.copy.notNow),
    ),
  );
}
