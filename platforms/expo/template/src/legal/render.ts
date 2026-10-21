import type { Evidence } from "./evidence.ts";

export type LegalOptions = {
  privacyContact?: string;
};

const DISCLAIMER =
  "This privacy policy was generated from the code listed under Sources. It is not legal advice and it must be reviewed before you publish it or submit it to a store.";

const SAFETY_NOTE =
  "These answers were generated from the code listed under Sources. They are not legal advice and they are not a Play Console submission. Review each answer before you enter it.";

type SafetyRow = {
  section: string;
  name: string;
  answer: "Yes" | "No" | "Not shown";
  collected: string;
  shared: string;
  ephemeral: string;
  required: string;
  purposes: string;
  evidence: string;
};

function hasDep(evidence: Evidence, name: string): boolean {
  return evidence.dependencies.includes(name);
}

function hasUsage(evidence: Evidence, key: string): boolean {
  return evidence.usageDescriptions.some((item) => item.key === key);
}

function hasAndroid(evidence: Evidence, permission: string): boolean {
  return evidence.androidPermissions.includes(permission);
}

function tableColumns(evidence: Evidence, table: string): string[] {
  return evidence.tables.find((item) => item.name === table)?.columns ?? [];
}

function noRow(section: string, name: string, evidenceText: string): SafetyRow {
  return {
    section,
    name,
    answer: "No",
    collected: "No",
    shared: "No",
    ephemeral: "Not applicable",
    required: "Not applicable",
    purposes: "Not applicable",
    evidence: evidenceText,
  };
}

function yesRow(section: string, name: string, fields: Omit<SafetyRow, "section" | "name" | "answer">): SafetyRow {
  return { section, name, answer: "Yes", ...fields };
}

function sdkNote(name: string): { role: string; data: string } {
  const consent = "Consent starts off in `platforms/expo/template/src/lib/consent.ts`. Nothing is sent until the person turns it on in `platforms/expo/template/src/features/settings/AnalyticsConsentSetting.ts`.";
  switch (name) {
    case "expo":
      return {
        role: "App runtime.",
        data: "This package is the Expo runtime. The template does not show it collecting personal data by itself. The Expo modules below are separate dependencies.",
      };
    case "react":
      return { role: "UI library.", data: "No network collection is shown for this package." };
    case "react-native":
      return { role: "UI runtime.", data: "No network collection is shown for this package by itself." };
    case "i18next":
      return {
        role: "In-app translation.",
        data: "Strings stay in locale JSON. The template does not show i18next sending those strings off the device.",
      };
    case "expo-localization":
      return {
        role: "Reads the device language.",
        data: "Used to choose a locale and, with PostHog, as an install peer. The template does not show a separate upload of the locale. See `platforms/expo/template/src/i18n/setup.ts` and `docs/analytics-setup.md`.",
      };
    case "expo-application":
    case "expo-device":
    case "expo-file-system":
      return {
        role: "PostHog install peer.",
        data: `Installed with PostHog (\`docs/analytics-setup.md\`). ${consent}`,
      };
    case "expo-camera":
      return {
        role: "Camera permission.",
        data: "The pre-permission screen explains camera use. The template does not upload a photo. See `platforms/expo/template/src/features/permissions`.",
      };
    case "expo-image-picker":
      return {
        role: "Photo library permission.",
        data: "The pre-permission screen explains photo access. The template does not upload a picture. `docs/events.md` says not to send the contents of a photo.",
      };
    case "expo-location":
      return {
        role: "Location permission.",
        data: "The pre-permission screen explains location. The template does not read or store coordinates.",
      };
    case "expo-audio":
      return {
        role: "Microphone permission.",
        data: "The pre-permission screen explains the microphone. The template does not upload a recording.",
      };
    case "expo-contacts":
      return {
        role: "Contacts permission.",
        data: "The pre-permission screen explains contacts. The template does not upload a contact. `docs/events.md` says not to send the contents of a contact.",
      };
    case "expo-calendar":
      return {
        role: "Calendar permission.",
        data: "The pre-permission screen explains calendar access. The template does not upload an event. `docs/events.md` says not to send the contents of a calendar event.",
      };
    case "expo-notifications":
      return {
        role: "Notification permission.",
        data: "The pre-permission screen explains notifications. The template does not show a push token being uploaded.",
      };
    case "posthog-react-native":
      return {
        role: "Product analytics.",
        data: `Events in \`docs/events.md\` are sent only through \`platforms/expo/template/src/lib/analytics.ts\`. ${consent}`,
      };
    case "@sentry/react-native":
      return {
        role: "Crash reporting.",
        data: `Crashes go through \`platforms/expo/template/src/lib/sentry.ts\` and the same analytics wrapper. ${consent} \`SENTRY_AUTH_TOKEN\` is an EAS build secret and is not an app dependency value.`,
      };
    case "react-native-purchases":
      return {
        role: "Purchases through RevenueCat.",
        data: "`platforms/expo/template/src/features/billing/revenueCatClient.ts` configures the SDK with a public key and calls purchase, restore, and customer info. It does not read a card number. Purchase history is handled by RevenueCat when those calls run.",
      };
    default:
      return {
        role: "Not classified.",
        data: "No data-safety note is written for this package. Do not mark the legal command done.",
      };
  }
}

function permissionEvidence(evidence: Evidence, usage: string, android: string[], extra: string): string {
  const declared: string[] = [];
  if (hasUsage(evidence, usage)) declared.push(`\`${usage}\``);
  for (const permission of android) {
    if (hasAndroid(evidence, permission)) declared.push(`\`${permission}\``);
  }
  const declaredText = declared.length > 0 ? `Declared in \`${evidence.appConfigPath}\`: ${declared.join(", ")}.` : `Not declared in \`${evidence.appConfigPath}\`.`;
  return `${declaredText} ${extra}`;
}

export function safetyRows(evidence: Evidence): SafetyRow[] {
  const profiles = tableColumns(evidence, "profiles");
  const usage = tableColumns(evidence, "ai_usage");
  const events = evidence.events.map((event) => event.name).join(", ");
  const messageStored = evidence.storesMessageText
    ? "A schema column can store message text."
    : "No message, content, or prompt column is in the schema.";

  const rows: SafetyRow[] = [
    noRow(
      "Location",
      "Approximate location",
      permissionEvidence(
        evidence,
        "NSLocationWhenInUseUsageDescription",
        ["android.permission.ACCESS_COARSE_LOCATION"],
        "The template does not read or store coordinates.",
      ),
    ),
    noRow(
      "Location",
      "Precise location",
      permissionEvidence(
        evidence,
        "NSLocationWhenInUseUsageDescription",
        ["android.permission.ACCESS_FINE_LOCATION"],
        "The template does not read or store coordinates. `docs/events.md` has no location property.",
      ),
    ),
    noRow(
      "Personal info",
      "Name",
      profiles.includes("display_name")
        ? "`public.profiles.display_name` exists in `backend/supabase/migrations/001_profiles.sql`. The Expo template has no screen that writes it, so this draft does not treat the name as collected."
        : "No name column is in the schema.",
    ),
    noRow(
      "Personal info",
      "Email address",
      "The migrations do not define an email column. `auth.users` is referenced, and its columns are not created in these files.",
    ),
    yesRow("Personal info", "User IDs", {
      collected: "Yes",
      shared: "Yes, with Supabase. RevenueCat also keeps its own app user id when `react-native-purchases` is installed.",
      ephemeral: "No. The id is the primary key of `profiles` and part of `ai_usage`.",
      required: "Required for a signed-in AI request. The template does not require a purchase to open.",
      purposes: "App functionality, Account management",
      evidence: `Columns: profiles (${profiles.join(", ")}); ai_usage (${usage.join(", ")}). \`platforms/expo/template/src/features/ai/aiClient.ts\` sends the session token to the AI proxy.`,
    }),
    noRow("Personal info", "Address", "No address column or form is in the schema or the template."),
    noRow("Personal info", "Phone number", "No phone column or form is in the schema or the template."),
    noRow("Personal info", "Race and ethnicity", "No such field is in the schema, events, or template."),
    noRow("Personal info", "Political or religious beliefs", "No such field is in the schema, events, or template."),
    noRow("Personal info", "Sexual orientation", "No such field is in the schema, events, or template."),
    noRow("Personal info", "Other info", "No other personal-info field is shown beyond the rows above."),
    noRow(
      "Financial info",
      "User payment info",
      "`platforms/expo/template/src/features/billing/revenueCatClient.ts` does not read a card, bank account, or billing address.",
    ),
  ];

  if (hasDep(evidence, "react-native-purchases")) {
    rows.push(
      yesRow("Financial info", "Purchase history", {
        collected: "Yes",
        shared: "Yes, with RevenueCat through `react-native-purchases`.",
        ephemeral: "No. The SDK keeps customer info.",
        required: "Optional. A purchase runs only when the person buys or restores.",
        purposes: "App functionality, Account management",
        evidence: "`platforms/expo/template/src/features/billing/revenueCatClient.ts` calls `getCustomerInfo`, `purchasePackage`, and `restorePurchases`.",
      }),
    );
  } else {
    rows.push(noRow("Financial info", "Purchase history", "`react-native-purchases` is not a dependency."));
  }

  rows.push(
    noRow("Financial info", "Credit score", "No credit field is in the schema or the template."),
    noRow("Financial info", "Other financial info", "No other financial field is shown."),
    noRow("Health and fitness", "Health info", "No health field or health SDK is shown."),
    noRow("Health and fitness", "Fitness info", "No fitness field or fitness SDK is shown."),
    noRow("Messages", "Emails", "The template does not read or send email."),
    noRow("Messages", "SMS or MMS", "The template does not read or send SMS or MMS."),
    noRow(
      "Messages",
      "Other in-app messages",
      "AI chat text is declared under App activity, Other user-generated content, so it is not omitted. It is not SMS, email, or a stored message column.",
    ),
    noRow(
      "Photos and videos",
      "Photos",
      permissionEvidence(
        evidence,
        "NSPhotoLibraryUsageDescription",
        ["android.permission.READ_MEDIA_IMAGES"],
        "The template does not upload a photo. `docs/events.md` says not to send the contents of a photo. `NSCameraUsageDescription` is the camera prompt, not an upload.",
      ),
    ),
    noRow("Photos and videos", "Videos", "No video permission or video upload is in the config or the template."),
    noRow(
      "Audio files",
      "Voice or sound recordings",
      permissionEvidence(
        evidence,
        "NSMicrophoneUsageDescription",
        ["android.permission.RECORD_AUDIO"],
        "The template does not upload a recording.",
      ),
    ),
    noRow("Audio files", "Music files", "No music library access is shown."),
    noRow("Audio files", "Other audio files", "No other audio collection is shown."),
    noRow("Files and docs", "Files and docs", "`expo-file-system` is a PostHog install peer. The template does not show it uploading the person's files."),
    noRow(
      "Calendar",
      "Calendar events",
      permissionEvidence(
        evidence,
        "NSCalendarsUsageDescription",
        ["android.permission.READ_CALENDAR", "android.permission.WRITE_CALENDAR"],
        "The template does not upload a calendar event. `docs/events.md` says not to send calendar contents.",
      ),
    ),
    noRow(
      "Contacts",
      "Contacts",
      permissionEvidence(
        evidence,
        "NSContactsUsageDescription",
        ["android.permission.READ_CONTACTS"],
        "The template does not upload a contact. `docs/events.md` says not to send contact contents.",
      ),
    ),
  );

  if (hasDep(evidence, "posthog-react-native")) {
    rows.push(
      yesRow("App activity", "App interactions", {
        collected: "Yes, only while consent is on",
        shared: "Yes, with PostHog.",
        ephemeral: "No. PostHog stores events. Retention at PostHog is not in this repo.",
        required: "Optional. Consent starts off.",
        purposes: "Analytics",
        evidence: `Events: ${events}. Properties stay coarse (\`${evidence.eventsPath}\`). The wrapper is \`platforms/expo/template/src/lib/analytics.ts\`.`,
      }),
    );
  } else {
    rows.push(noRow("App activity", "App interactions", "`posthog-react-native` is not a dependency."));
  }

  rows.push(
    noRow("App activity", "In-app search history", "No search-history field or event is shown."),
    noRow("App activity", "Installed apps", "The template does not read the list of installed apps."),
  );

  if (evidence.forwardsMessagesToOpenRouter) {
    rows.push(
      yesRow("App activity", "Other user-generated content", {
        collected: "Yes, when a signed-in person sends an AI message",
        shared: "Yes, with OpenRouter through the Supabase `ai-proxy` function.",
        ephemeral: "Not shown. The SQL tables do not store the text. OpenRouter's retention is not in this repo, so do not mark this ephemeral.",
        required: "Required for the AI feature. The feature itself is not required to open the app.",
        purposes: "App functionality",
        evidence: `${messageStored} \`backend/supabase/functions/ai-proxy/handler.ts\` posts \`model\` and \`messages\` to \`https://openrouter.ai/api/v1/chat/completions\`. \`docs/events.md\` records the model id, not the prompt.`,
      }),
    );
  } else {
    rows.push(
      noRow(
        "App activity",
        "Other user-generated content",
        "The AI proxy handler does not show message text being forwarded.",
      ),
    );
  }

  rows.push(noRow("App activity", "Other actions", "No other action is shown beyond the events and the AI request count."));
  rows.push(noRow("Web browsing", "Web browsing history", "The template does not read browsing history."));

  if (hasDep(evidence, "@sentry/react-native")) {
    rows.push(
      yesRow("App info and performance", "Crash logs", {
        collected: "Yes, only while consent is on",
        shared: "Yes, with Sentry.",
        ephemeral: "No. Sentry stores the issue. Retention at Sentry is not in this repo.",
        required: "Optional. Consent starts off.",
        purposes: "Analytics",
        evidence: "`platforms/expo/template/src/lib/sentry.ts` and `platforms/expo/template/src/lib/analytics.ts`. Source map upload uses an EAS token that stays out of the app.",
      }),
      yesRow("App info and performance", "Diagnostics", {
        collected: "Yes, only while consent is on",
        shared: "Yes, with Sentry, as part of the crash report.",
        ephemeral: "No.",
        required: "Optional. Consent starts off.",
        purposes: "Analytics",
        evidence: "The same Sentry path as crash logs. The template does not show a separate diagnostics product.",
      }),
    );
  } else {
    rows.push(noRow("App info and performance", "Crash logs", "`@sentry/react-native` is not a dependency."));
    rows.push(noRow("App info and performance", "Diagnostics", "`@sentry/react-native` is not a dependency."));
  }

  rows.push(noRow("App info and performance", "Other app performance data", "No other performance SDK is shown."));

  if (hasDep(evidence, "posthog-react-native")) {
    rows.push(
      yesRow("Device or other IDs", "Device or other IDs", {
        collected: "Yes, only while consent is on",
        shared: "Yes, with PostHog.",
        ephemeral: "No.",
        required: "Optional. Consent starts off.",
        purposes: "Analytics",
        evidence:
          "The analytics wrapper can call `identify`. `expo-device`, `expo-application`, and `expo-localization` are PostHog install peers in `docs/analytics-setup.md`. The template does not show an advertising id.",
      }),
    );
  } else {
    rows.push(
      noRow(
        "Device or other IDs",
        "Device or other IDs",
        "No advertising-id API is shown. PostHog is not a dependency, so this draft does not declare a device id.",
      ),
    );
  }

  return rows;
}

function contactLine(contact: string | undefined): string {
  const value = contact?.trim() ?? "";
  if (value === "") return "A contact address is not present in the code. Add one before you publish.";
  return `People can ask about their data at ${value}.`;
}

function sourceList(evidence: Evidence): string[] {
  return [
    evidence.appConfigPath,
    evidence.packageJsonPath,
    evidence.eventsPath,
    ...evidence.migrationPaths,
    evidence.handlerPath,
    "platforms/expo/template/src/lib/analytics.ts",
    "platforms/expo/template/src/lib/consent.ts",
    "platforms/expo/template/src/features/ai/aiClient.ts",
    "platforms/expo/template/src/features/billing/revenueCatClient.ts",
    "platforms/expo/template/src/features/permissions",
    "docs/analytics-setup.md",
  ];
}

export function renderPrivacyPolicy(evidence: Evidence, options: LegalOptions = {}): string {
  const rows = safetyRows(evidence);
  const collected = rows.filter((row) => row.answer === "Yes");
  const lines = [
    "# Privacy policy",
    "",
    DISCLAIMER,
    "",
    "## Sources",
    "",
    "Platform evidence: expo template.",
    "",
    ...sourceList(evidence).map((item) => `- \`${item}\``),
    "",
    "## App",
    "",
    `Configured name: \`${evidence.appName}\`. iOS bundle id: \`${evidence.bundleIdentifier}\`. Android package: \`${evidence.androidPackage}\`.`,
    "",
    "## Data the code shows",
    "",
    ...collected.map((row) => `- ${row.section} / ${row.name}. ${row.evidence}`),
    "",
    "This draft does not claim a practice that those files do not show. It does not state a retention period for PostHog, Sentry, RevenueCat, or OpenRouter, because that period is not in this repo.",
    "",
    "## SDKs",
    "",
    "Every dependency in the app package is listed here.",
    "",
  ];

  for (const name of evidence.dependencies) {
    const note = sdkNote(name);
    lines.push(`### \`${name}\``, "", `Role: ${note.role}`, "", note.data, "");
  }

  if (evidence.unclassified.length > 0) {
    lines.push(
      "Unclassified dependencies: " + evidence.unclassified.map((name) => `\`${name}\``).join(", ") + ". Do not mark the legal command done.",
      "",
    );
  }

  lines.push(
    "No advertising SDK is in this dependency list.",
    "",
    "## Server-side services",
    "",
    "### Supabase",
    "",
    "`public.profiles` stores the auth user id, an optional display name, and timestamps. `public.ai_usage` stores the user id, the UTC day, and a request count. Row level security limits a signed-in user to their own rows. The app calls `functions/v1/ai-proxy` with the user session token. Evidence: the migration files and `platforms/expo/template/src/features/ai/aiClient.ts`.",
    "",
    "### OpenRouter",
    "",
  );

  if (evidence.forwardsMessagesToOpenRouter) {
    lines.push(
      "The edge function posts the model id and the message text to `https://openrouter.ai/api/v1/chat/completions`. The OpenRouter key stays a Supabase secret. It is not an app dependency. The response body from a failed provider call is not forwarded. Evidence: `backend/supabase/functions/ai-proxy/handler.ts`.",
      "",
    );
  } else {
    lines.push("The AI proxy handler does not show a call to OpenRouter.", "");
  }

  lines.push("## Permissions", "");
  if (evidence.usageDescriptions.length === 0 && evidence.androidPermissions.length === 0) {
    lines.push("No usage strings or Android permissions were found in the app config.", "");
  } else {
    for (const item of evidence.usageDescriptions) {
      lines.push(`- \`${item.key}\`: ${item.text}`);
    }
    for (const permission of evidence.androidPermissions) {
      lines.push(`- \`${permission}\``);
    }
    lines.push("");
  }
  if (evidence.plugins.length > 0) {
    lines.push("Config plugins: " + evidence.plugins.map((name) => `\`${name}\``).join(", ") + ".", "");
  }
  lines.push(
    "Bluetooth is declared with `NSBluetoothAlwaysUsageDescription` and `android.permission.BLUETOOTH_CONNECT` when those strings are in the config. Expo has no first-party Bluetooth permission package in this template.",
    "",
    "iOS notifications are requested through `expo-notifications`. This config has no separate notification usage string.",
    "",
    "## Analytics events",
    "",
    "These names come from `docs/events.md`. Screen names are not rows in that file.",
    "",
  );
  for (const event of evidence.events) {
    lines.push(`- \`${event.name}\`: ${event.when} Properties: ${event.properties}.`);
  }
  lines.push(
    "",
    "## Database",
    "",
  );
  for (const table of evidence.tables) {
    lines.push(`- \`public.${table.name}\`: ${table.columns.join(", ")}`);
  }
  lines.push(
    "",
    evidence.storesMessageText
      ? "The schema has a column that can store message text."
      : "The schema does not store message text. AI message text is forwarded by the edge function and is not a column.",
    "",
    "## Consent",
    "",
    "Analytics and crash reporting stay off until the person enables them. Evidence: `platforms/expo/template/src/lib/consent.ts`.",
    "",
    "## Deletion",
    "",
  );
  if (evidence.cascadesOnAuthDelete) {
    lines.push("Deleting an `auth.users` row cascades to `profiles` and `ai_usage` (`on delete cascade`).");
  } else {
    lines.push("The migrations do not show `on delete cascade`.");
  }
  if (evidence.profileDeletePolicy) {
    lines.push("`profiles_delete_own` lets a signed-in user delete their own profile row.");
  }
  lines.push(
    "The Expo template has no screen that deletes the auth user or sends a deletion request. Do not answer the Play deletion question as Yes until that path exists.",
    "",
    "## Account creation",
    "",
    "The schema references `auth.users`. The template has no sign-up screen, so this draft does not name a creation method.",
    "",
    "## Encryption in transit",
    "",
    "The OpenRouter call in the edge function uses `https://openrouter.ai`. The Supabase URL is copied from `EXPO_PUBLIC_SUPABASE_URL` without an https check in `aiClient.ts`. The PostHog host is chosen by the developer and is not checked in the analytics wrapper. Do not answer the Play question as Yes until those hosts are https in the configuration you ship.",
    "",
    "## Children",
    "",
    "Nothing in the code states an age group or a children's policy.",
    "",
    "## Contact",
    "",
    contactLine(options.privacyContact),
    "",
  );
  return lines.join("\n");
}

function overviewAnswer(rows: SafetyRow[]): string {
  return rows.some((row) => row.answer === "Yes") ? "Yes" : "No";
}

export function renderDataSafety(evidence: Evidence): string {
  const rows = safetyRows(evidence);
  const lines = [
    "# Google Play Data safety answers",
    "",
    SAFETY_NOTE,
    "",
    "## Sources",
    "",
    "Platform evidence: expo template.",
    "",
    ...sourceList(evidence).map((item) => `- \`${item}\``),
    "",
    "## Data collection and security",
    "",
    "### Does your app collect or share any of the required user data types?",
    "",
    `Answer: ${overviewAnswer(rows)}`,
    "",
    "Evidence: the Yes rows in Data types below. Each one names the file that shows the collection.",
    "",
    "### Is all of the user data collected by your app encrypted in transit?",
    "",
    "Answer: Not shown. Do not select Yes.",
    "",
    "Evidence: `backend/supabase/functions/ai-proxy/handler.ts` posts to `https://openrouter.ai/api/v1/chat/completions`. `platforms/expo/template/src/features/ai/aiClient.ts` does not require `EXPO_PUBLIC_SUPABASE_URL` to be https. The PostHog host is not checked in `platforms/expo/template/src/lib/analytics.ts`.",
    "",
    "### Which methods of account creation does your app support?",
    "",
    "Answer: Not shown. Do not select a method.",
    "",
    "Evidence: the migrations reference `auth.users`. The Expo template has no sign-up screen.",
    "",
    "### Do you provide a way for users to request that their data is deleted?",
    "",
    "Answer: No",
    "",
    "Evidence: `on delete cascade` removes `profiles` and `ai_usage` when an auth user is deleted, and `profiles_delete_own` can delete the profile row. The template has no deletion-request screen, so the form answer stays No.",
    "",
    "## Data types",
    "",
  ];

  let section = "";
  for (const row of rows) {
    if (row.section !== section) {
      section = row.section;
      lines.push(`## ${section}`, "");
    }
    lines.push(
      `### ${row.name}`,
      "",
      `Answer: ${row.answer}`,
      "",
      `Collected: ${row.collected}`,
      "",
      `Shared: ${row.shared}`,
      "",
      `Processed ephemerally: ${row.ephemeral}`,
      "",
      `Required: ${row.required}`,
      "",
      `Purposes: ${row.purposes}`,
      "",
      `Evidence: ${row.evidence}`,
      "",
    );
  }

  lines.push(
    "## SDKs checked",
    "",
    "Every app dependency is named in the privacy policy. This form uses the same list.",
    "",
    ...evidence.dependencies.map((name) => `- \`${name}\``),
    "",
  );
  if (evidence.unclassified.length > 0) {
    lines.push(
      "Unclassified: " + evidence.unclassified.map((name) => `\`${name}\``).join(", ") + ". Do not mark the legal command done.",
      "",
    );
  }
  return lines.join("\n");
}

function meaningfulLines(text: string): string[] {
  return text.split(/\r?\n/).filter((line) => line.trim() !== "");
}

function extras(source: string[], other: string[]): string[] {
  const left = new Map<string, number>();
  for (const line of other) left.set(line, (left.get(line) ?? 0) + 1);
  const out: string[] = [];
  for (const line of source) {
    const count = left.get(line) ?? 0;
    if (count > 0) left.set(line, count - 1);
    else out.push(line);
  }
  return out;
}

export function diffDraft(previous: string, next: string): { added: string[]; removed: string[] } {
  const prev = meaningfulLines(previous);
  const nextLines = meaningfulLines(next);
  return { added: extras(nextLines, prev), removed: extras(prev, nextLines) };
}

function formatSide(title: string, lines: string[]): string[] {
  if (lines.length === 0) return [`### ${title}`, "", "None.", ""];
  return [`### ${title}`, "", ...lines.map((line) => `> ${line}`), ""];
}

export function renderChanges(
  previous: { privacy: string; safety: string } | null,
  next?: { privacy: string; safety: string },
): string {
  if (!previous) {
    return ["# Legal draft changes", "", "First draft. There is no previous version.", ""].join("\n");
  }
  if (!next) throw new Error("A rerun needs the new draft");
  const privacy = diffDraft(previous.privacy, next.privacy);
  const safety = diffDraft(previous.safety, next.safety);
  if (privacy.added.length === 0 && privacy.removed.length === 0 && safety.added.length === 0 && safety.removed.length === 0) {
    return ["# Legal draft changes", "", "No changes since the previous draft.", ""].join("\n");
  }
  return [
    "# Legal draft changes",
    "",
    "## Privacy policy",
    "",
    ...formatSide("Added", privacy.added),
    ...formatSide("Removed", privacy.removed),
    "## Data safety answers",
    "",
    ...formatSide("Added", safety.added),
    ...formatSide("Removed", safety.removed),
  ].join("\n");
}

export { DISCLAIMER, SAFETY_NOTE };
