import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import type { BillingClient } from "./types.ts";
import { useEntitlement } from "./useEntitlement.ts";
import { usePaywall, type PaywallPackage } from "./paywall.ts";

export function PaywallScreen(props: { client: BillingClient; entitlementId: string }) {
  const { model, reload } = usePaywall(props.client);
  const entitlement = useEntitlement(props.entitlementId, props.client);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  if (entitlement.active) {
    return (
      <View>
        <Text>Premium is active on this account.</Text>
      </View>
    );
  }

  if (model.status === "loading" || entitlement.status === "loading") {
    return (
      <View>
        <ActivityIndicator />
        <Text>Loading plans…</Text>
      </View>
    );
  }

  if (model.status === "error" || entitlement.status === "error") {
    const message = model.status === "error" ? model.message : entitlement.errorMessage;
    return (
      <View>
        <Text>Plans could not be loaded.</Text>
        {message ? <Text>{message}</Text> : null}
        <Pressable onPress={() => void reload()} accessibilityRole="button">
          <Text>Try again</Text>
        </Pressable>
        <RestoreButton onPress={() => void entitlement.restore()} />
      </View>
    );
  }

  if (model.status === "empty") {
    return (
      <View>
        <Text>No plans are available right now.</Text>
        <RestoreButton onPress={() => void entitlement.restore()} />
      </View>
    );
  }

  return (
    <View>
      {model.packages.map((pkg) => (
        <PackageRow
          key={pkg.identifier}
          pkg={pkg}
          onPress={() => {
            setPurchaseError(null);
            void props.client.purchasePackage(pkg.source).catch((error: unknown) => {
              if (isUserCancelled(error)) return;
              const message = error instanceof Error ? error.message : "Purchase failed";
              setPurchaseError(message);
            });
          }}
        />
      ))}
      {purchaseError ? <Text>{purchaseError}</Text> : null}
      <RestoreButton onPress={() => void entitlement.restore()} />
    </View>
  );
}

function PackageRow(props: { pkg: PaywallPackage; onPress: () => void }) {
  const price = props.pkg.priceString.trim() === "" ? "Price unavailable" : props.pkg.priceString;
  return (
    <Pressable onPress={props.onPress} accessibilityRole="button">
      <Text>{props.pkg.title}</Text>
      <Text>{price}</Text>
    </Pressable>
  );
}

function RestoreButton(props: { onPress: () => void }) {
  return (
    <Pressable onPress={props.onPress} accessibilityRole="button">
      <Text>Restore purchases</Text>
    </Pressable>
  );
}

function isUserCancelled(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("userCancelled" in error)) return false;
  return error.userCancelled === true;
}
