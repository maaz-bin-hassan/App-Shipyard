export type RevenueCatKeyInput = {
  platform: string;
  release: boolean;
  testKey?: string;
  appleKey?: string;
  googleKey?: string;
};

/**
 * Picks the public SDK key. Debug builds may use the Test Store key.
 * Release builds refuse a Test Store key. The key is returned to the caller
 * and is not logged.
 */
export function selectRevenueCatApiKey(input: RevenueCatKeyInput): string {
  const testKey = blankToUndefined(input.testKey);
  const appleKey = blankToUndefined(input.appleKey);
  const googleKey = blankToUndefined(input.googleKey);

  if (!input.release && testKey) {
    if (!testKey.startsWith("test_")) {
      throw new Error("The Test Store public SDK key must start with test_");
    }
    return testKey;
  }

  const key = input.platform === "ios" ? appleKey : googleKey;
  if (!key) {
    throw new Error("RevenueCat public SDK key is missing");
  }
  if (key.startsWith("test_")) {
    throw new Error("Refusing to configure a release build with a Test Store key");
  }
  return key;
}

function blankToUndefined(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}
