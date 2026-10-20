import { createElement, type ReactNode } from "react";
import type { BillingClient } from "./types.ts";
import { useEntitlement } from "./useEntitlement.ts";

export function GatedFeature(props: {
  entitlementId: string;
  client: BillingClient;
  children: ReactNode;
  locked: ReactNode;
  loading?: ReactNode;
  error?: (message: string) => ReactNode;
}): ReactNode {
  const state = useEntitlement(props.entitlementId, props.client);
  if (state.status === "loading") {
    return props.loading ?? createElement("span", null, "Checking your purchase…");
  }
  if (state.status === "error") {
    const message = state.errorMessage ?? "Could not load purchases";
    return props.error ? props.error(message) : createElement("span", null, message);
  }
  if (!state.active) return props.locked;
  return props.children;
}
