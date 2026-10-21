import { createElement, type ReactNode } from "react";
import { useI18n } from "../../i18n/useI18n.ts";
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
  const { t } = useI18n();
  const state = useEntitlement(props.entitlementId, props.client);
  if (state.status === "loading") {
    return props.loading ?? createElement("span", null, t("billing.checking"));
  }
  if (state.status === "error") {
    const message = state.errorMessage ?? t("billing.loadFailed");
    return props.error ? props.error(message) : createElement("span", null, message);
  }
  if (!state.active) return props.locked;
  return props.children;
}
