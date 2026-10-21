import { Text, View } from "react-native";
import { useI18n } from "../../i18n/useI18n.ts";
import { entitlementId } from "./billingConfig.ts";
import { GatedFeature } from "./GatedFeature.ts";
import { PaywallScreen } from "./PaywallScreen.tsx";
import type { BillingClient } from "./types.ts";

export function PremiumExample(props: { client: BillingClient; featureName: string }) {
  const { t } = useI18n();
  return (
    <GatedFeature
      entitlementId={entitlementId}
      client={props.client}
      loading={<Text>{t("billing.checking")}</Text>}
      error={(message) => <Text>{message}</Text>}
      locked={<PaywallScreen client={props.client} entitlementId={entitlementId} />}
    >
      <View>
        <Text>{props.featureName}</Text>
      </View>
    </GatedFeature>
  );
}
