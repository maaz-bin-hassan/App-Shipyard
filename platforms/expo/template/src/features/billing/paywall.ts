import { useCallback, useEffect, useState } from "react";
import { translate } from "../../i18n/translate.ts";
import type { BillingClient, PackageLike } from "./types.ts";

export type PaywallPackage = {
  identifier: string;
  productId: string;
  title: string;
  priceString: string;
  source: PackageLike;
};

export type PaywallModel =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "empty" }
  | { status: "ready"; packages: PaywallPackage[] };

export async function loadPaywall(client: BillingClient): Promise<PaywallModel> {
  try {
    const offerings = await client.getOfferings();
    const packages = offerings.current?.availablePackages ?? [];
    if (packages.length === 0) return { status: "empty" };
    return {
      status: "ready",
      packages: packages.map((pkg) => ({
        identifier: pkg.identifier,
        productId: pkg.product.identifier,
        title: pkg.product.title,
        priceString: pkg.product.priceString,
        source: pkg,
      })),
    };
  } catch (error) {
    const message = error instanceof Error && error.message.trim() !== "" ? error.message : translate("billing.plansLoadFailed");
    return { status: "error", message };
  }
}

export function usePaywall(client: BillingClient): { model: PaywallModel; reload: () => Promise<PaywallModel> } {
  const [model, setModel] = useState<PaywallModel>({ status: "loading" });

  const reload = useCallback(async () => {
    setModel({ status: "loading" });
    const next = await loadPaywall(client);
    setModel(next);
    return next;
  }, [client]);

  useEffect(() => {
    let cancelled = false;
    setModel({ status: "loading" });
    loadPaywall(client).then((next) => {
      if (!cancelled) setModel(next);
    });
    return () => {
      cancelled = true;
    };
  }, [client]);

  return { model, reload };
}
