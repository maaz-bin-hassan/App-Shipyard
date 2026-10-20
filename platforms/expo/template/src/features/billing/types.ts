export type CustomerInfoLike = {
  entitlements: {
    active: Record<string, { identifier: string } | undefined>;
  };
};

export type PackageLike = {
  identifier: string;
  product: {
    identifier: string;
    title: string;
    priceString: string;
  };
  /** Store package object passed back to purchasePackage. */
  raw?: unknown;
};

export type OfferingsLike = {
  current: { availablePackages: PackageLike[] } | null;
};

export type BillingClient = {
  getCustomerInfo: () => Promise<CustomerInfoLike>;
  restorePurchases: () => Promise<CustomerInfoLike>;
  getOfferings: () => Promise<OfferingsLike>;
  purchasePackage: (pkg: PackageLike) => Promise<{ customerInfo: CustomerInfoLike }>;
  addCustomerInfoUpdateListener?: (listener: (info: CustomerInfoLike) => void) => () => void;
};

export type EntitlementStatus = "loading" | "error" | "active" | "inactive";

export type EntitlementState = {
  status: EntitlementStatus;
  active: boolean;
  errorMessage: string | null;
  refresh: () => Promise<void>;
  restore: () => Promise<void>;
};
