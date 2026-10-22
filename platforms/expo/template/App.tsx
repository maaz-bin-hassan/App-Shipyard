import { useEffect, useMemo, useState } from "react";
import { Image, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { appName } from "./src/app/identity.ts";
import { selectRevenueCatApiKey } from "./src/features/billing/apiKey.ts";
import { entitlementId, premiumFeatures } from "./src/features/billing/billingConfig.ts";
import { PaywallScreen } from "./src/features/billing/PaywallScreen.tsx";
import { PremiumExample } from "./src/features/billing/PremiumExample.tsx";
import type { BillingClient } from "./src/features/billing/types.ts";
import { AnalyticsConsentSetting } from "./src/features/settings/AnalyticsConsentSetting.ts";
import { useI18n } from "./src/i18n/useI18n.ts";
import { createAnalytics } from "./src/lib/analytics.ts";
import { createMemoryConsentStore } from "./src/lib/consent.ts";
import { tokens } from "./src/theme/tokens.ts";
import { Body, Heading, Screen, Stack } from "./src/ui/components.ts";
import icon from "./assets/icon.png";

const theme = tokens;
const env = process.env as Record<string, string | undefined>;

const PUBLIC_KEYS = [
  "EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY",
  "EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY",
  "EXPO_PUBLIC_REVENUECAT_TEST_API_KEY",
  "EXPO_PUBLIC_POSTHOG_API_KEY",
  "EXPO_PUBLIC_POSTHOG_HOST",
  "EXPO_PUBLIC_SENTRY_DSN",
  "EXPO_PUBLIC_SUPABASE_URL",
  "EXPO_PUBLIC_SUPABASE_ANON_KEY",
] as const;

type Tab = "home" | "premium" | "plans" | "settings";

export default function App() {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>("home");
  const analytics = useMemo(() => createAnalytics({ consent: false }), []);
  const consentStore = useMemo(() => createMemoryConsentStore(false), []);
  const [billing, setBilling] = useState<BillingClient | null>(null);
  const [billingReady, setBillingReady] = useState(false);
  const missing = PUBLIC_KEYS.filter((key) => (env[key] ?? "").trim() === "");
  const featureName = premiumFeatures[0] ?? "Premium tools";

  useEffect(() => {
    let cancelled = false;
    void openBilling(env).then((client) => {
      if (cancelled) return;
      setBilling(client);
      setBillingReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: theme.space.lg }}>
        {tab === "home" ? (
          <Screen tokens={theme}>
            <Stack tokens={theme}>
              <Image
                source={icon}
                accessibilityLabel={appName}
                style={{ width: theme.space.xl * 2, height: theme.space.xl * 2 }}
              />
              <Heading tokens={theme}>{appName}</Heading>
              <Body tokens={theme}>{t("shell.home.body")}</Body>
              <Body tokens={theme}>{t("shell.home.backend")}</Body>
            </Stack>
          </Screen>
        ) : null}
        {tab === "premium" ? (
          <Screen tokens={theme}>
            <Stack tokens={theme}>
              <Heading tokens={theme}>{t("shell.nav.premium")}</Heading>
              {billing ? (
                <PremiumExample client={billing} featureName={featureName} />
              ) : (
                <Body tokens={theme}>{billingReady ? t("shell.premium.needsKey") : t("billing.checking")}</Body>
              )}
            </Stack>
          </Screen>
        ) : null}
        {tab === "plans" ? (
          <Screen tokens={theme}>
            <Stack tokens={theme}>
              <Heading tokens={theme}>{t("shell.nav.plans")}</Heading>
              {billing ? (
                <PaywallScreen client={billing} entitlementId={entitlementId} />
              ) : (
                <Body tokens={theme}>{billingReady ? t("shell.plans.needsKey") : t("billing.checking")}</Body>
              )}
            </Stack>
          </Screen>
        ) : null}
        {tab === "settings" ? (
          <Screen tokens={theme}>
            <Stack tokens={theme}>
              <Heading tokens={theme}>{t("shell.nav.settings")}</Heading>
              <AnalyticsConsentSetting store={consentStore} analytics={analytics} />
              <Heading tokens={theme}>{t("shell.setup.title")}</Heading>
              <Body tokens={theme}>{t("shell.setup.body")}</Body>
              {missing.map((key) => (
                <Body key={key} tokens={theme}>
                  {key}
                </Body>
              ))}
            </Stack>
          </Screen>
        ) : null}
      </ScrollView>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.space.sm, padding: theme.space.sm }}>
        <TabButton label={t("shell.nav.home")} selected={tab === "home"} onPress={() => setTab("home")} />
        <TabButton label={t("shell.nav.premium")} selected={tab === "premium"} onPress={() => setTab("premium")} />
        <TabButton label={t("shell.nav.plans")} selected={tab === "plans"} onPress={() => setTab("plans")} />
        <TabButton label={t("shell.nav.settings")} selected={tab === "settings"} onPress={() => setTab("settings")} />
      </View>
    </View>
  );
}

function TabButton(props: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={props.onPress}
      style={{
        backgroundColor: props.selected ? theme.color.primary : theme.color.surface,
        padding: theme.space.sm,
      }}
    >
      <Text
        style={{
          color: props.selected ? theme.color.background : theme.color.text,
          fontSize: theme.type.button.fontSize,
          lineHeight: theme.type.button.lineHeight,
          fontWeight: theme.type.button.fontWeight as "600",
        }}
      >
        {props.label}
      </Text>
    </Pressable>
  );
}

async function openBilling(values: Record<string, string | undefined>): Promise<BillingClient | null> {
  const release = typeof __DEV__ !== "undefined" ? !__DEV__ : false;
  try {
    selectRevenueCatApiKey({
      platform: Platform.OS,
      release,
      testKey: values.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY,
      appleKey: values.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY,
      googleKey: values.EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY,
    });
  } catch {
    return null;
  }
  try {
    const revenueCat = await import("./src/features/billing/revenueCatClient.ts");
    revenueCat.configureRevenueCat(values, release);
    return revenueCat.createRevenueCatClient();
  } catch {
    return null;
  }
}
