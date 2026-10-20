import { useCallback, useEffect, useState } from "react";
import type { BillingClient, CustomerInfoLike, EntitlementState, EntitlementStatus } from "./types.ts";

export function isEntitled(info: CustomerInfoLike | null, entitlementId: string): boolean {
  if (!info || entitlementId.trim() === "") return false;
  return info.entitlements.active[entitlementId] != null;
}

function errorText(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim() !== "") return error.message;
  return fallback;
}

export function useEntitlement(entitlementId: string, client: BillingClient): EntitlementState {
  const [status, setStatus] = useState<EntitlementStatus>("loading");
  const [active, setActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const apply = useCallback(
    (info: CustomerInfoLike) => {
      const next = isEntitled(info, entitlementId);
      setActive(next);
      setStatus(next ? "active" : "inactive");
      setErrorMessage(null);
    },
    [entitlementId],
  );

  const fail = useCallback((error: unknown, fallback: string) => {
    setActive(false);
    setStatus("error");
    setErrorMessage(errorText(error, fallback));
  }, []);

  const refresh = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);
    try {
      apply(await client.getCustomerInfo());
    } catch (error) {
      fail(error, "Could not load purchases");
    }
  }, [apply, client, fail]);

  const restore = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);
    try {
      apply(await client.restorePurchases());
    } catch (error) {
      fail(error, "Could not restore purchases");
    }
  }, [apply, client, fail]);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setErrorMessage(null);
    client.getCustomerInfo().then(
      (info) => {
        if (!cancelled) apply(info);
      },
      (error: unknown) => {
        if (!cancelled) fail(error, "Could not load purchases");
      },
    );
    const unsubscribe = client.addCustomerInfoUpdateListener?.((info) => {
      if (!cancelled) apply(info);
    });
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [apply, client, fail]);

  return { status, active, errorMessage, refresh, restore };
}
