/**
 * react-native-purchases ships native code. Expo Go only runs RevenueCat's
 * Preview API Mode, and that mode does not complete a real purchase. Install
 * expo-dev-client and run a development build before a Test Store or sandbox
 * purchase. See docs/billing-setup.md.
 */
import { Platform } from "react-native";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import { selectRevenueCatApiKey } from "./apiKey.ts";
import type { BillingClient, CustomerInfoLike, PackageLike } from "./types.ts";

type PurchasesCustomerInfo = {
  entitlements: {
    active: Record<string, { identifier: string } | undefined>;
  };
};

type PurchasesProduct = {
  identifier: string;
  title: string;
  priceString: string;
};

type PurchasesPackage = {
  identifier: string;
  product: PurchasesProduct;
};

type PurchasesOfferings = {
  current: { availablePackages: PurchasesPackage[] } | null;
};

export function configureRevenueCat(
  env: Record<string, string | undefined>,
  release = typeof __DEV__ !== "undefined" ? !__DEV__ : false,
): void {
  const apiKey = selectRevenueCatApiKey({
    platform: Platform.OS,
    release,
    testKey: env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY,
    appleKey: env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY,
    googleKey: env.EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY,
  });
  Purchases.setLogLevel(release ? LOG_LEVEL.INFO : LOG_LEVEL.DEBUG);
  Purchases.configure({ apiKey });
}

export function createRevenueCatClient(): BillingClient {
  return {
    getCustomerInfo: async () => toCustomerInfo(await Purchases.getCustomerInfo()),
    restorePurchases: async () => toCustomerInfo(await Purchases.restorePurchases()),
    getOfferings: async () => {
      const offerings = (await Purchases.getOfferings()) as PurchasesOfferings;
      if (!offerings.current) return { current: null };
      return {
        current: {
          availablePackages: offerings.current.availablePackages.map(toPackage),
        },
      };
    },
    purchasePackage: async (pkg) => {
      const raw = pkg.raw as PurchasesPackage | undefined;
      if (!raw) throw new Error("Missing store package");
      const result = await Purchases.purchasePackage(raw as Parameters<typeof Purchases.purchasePackage>[0]);
      return { customerInfo: toCustomerInfo(result.customerInfo) };
    },
    addCustomerInfoUpdateListener: (listener) => {
      const wrapped = (info: PurchasesCustomerInfo) => listener(toCustomerInfo(info));
      Purchases.addCustomerInfoUpdateListener(wrapped);
      return () => {
        Purchases.removeCustomerInfoUpdateListener(wrapped);
      };
    },
  };
}

function toCustomerInfo(info: PurchasesCustomerInfo): CustomerInfoLike {
  return { entitlements: { active: info.entitlements.active } };
}

function toPackage(pkg: PurchasesPackage): PackageLike {
  return {
    identifier: pkg.identifier,
    product: {
      identifier: pkg.product.identifier,
      title: pkg.product.title,
      priceString: pkg.product.priceString,
    },
    raw: pkg,
  };
}
