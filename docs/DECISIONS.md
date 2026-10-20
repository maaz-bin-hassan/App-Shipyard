# Architecture decisions

These records capture planning decisions for fastAppshipKit. They do not mean the behavior is implemented.

## ADR-001: Platform selection at setup

- **Status:** Accepted
- **Decision:** When a developer initializes a project, they select one of four targets: React Native with Expo, Flutter, Android native with Kotlin and Jetpack Compose, or iOS native with Swift and SwiftUI.
- **Rationale:** One explicit target keeps generated projects and agent instructions coherent. Supporting every platform inside a single generated app would mix toolchains, stores, and UI frameworks.

## ADR-002: Platform implementation order

- **Status:** Accepted
- **Decision:** Build platform adapters in this order: Expo, Flutter, Android native, then iOS native.
- **Rationale:** Expo and Flutter cover the largest cross-platform starting points first. Native Android and iOS follow after the shared workflow is proven. This is the planned sequence, not a claim that any adapter already works.

## ADR-003: Platform adapter architecture

- **Status:** Accepted
- **Decision:** Each platform adapter lives in its own directory under `adapters/` and provides a manifest. The minimal manifest contract is:

  | Field | Purpose |
  | --- | --- |
  | `id` | Stable adapter id: `expo`, `flutter`, `android`, or `ios`. |
  | `displayName` | Name shown to the developer. |
  | `status` | `planned`, `experimental`, or `supported`. |
  | `prerequisites` | Tools and accounts required before setup. |
  | `commands` | Slash commands this adapter implements. |
  | `configuration` | Required non-secret configuration keys. |
  | `capabilities` | What the adapter can scaffold, check, or document. |

  Adapter directories and manifests will be added when each platform is actually started. This record defines the contract only.
- **Rationale:** A small manifest lets agents discover an adapter without loading a whole application template. Waiting to generate four platform trees avoids implying that unfinished adapters are usable.

## ADR-004: Shared backend

- **Status:** Accepted
- **Decision:** Generated applications will use one shared Supabase backend architecture, with separate project configuration, environment isolation, authentication boundaries, and secure server-side operations.
- **Rationale:** A common backend shape lets workflows stay portable across mobile targets while keeping development, preview, and production data and keys apart.

## ADR-005: Billing

- **Status:** Accepted
- **Decision:** Use RevenueCat for subscription and in-app purchase integrations where the platform supports it. Platform-specific purchase capabilities and store policies still apply.
- **Rationale:** RevenueCat is a single integration point for store billing. It does not replace App Store, Play Store, or platform rules, and it should be omitted where a target cannot support it.

## ADR-006: Analytics and error monitoring

- **Status:** Accepted
- **Decision:** Use PostHog for product analytics and Sentry for error monitoring. Both integrations must be configurable, and privacy considerations must be documented before either is turned on in a generated app.
- **Rationale:** Separating product analytics from crash reporting keeps each tool focused. Making them configurable lets a developer disable collection or replace keys per environment.

## ADR-007: AI model routing

- **Status:** Accepted
- **Decision:** Route model calls through OpenRouter from a server-side Supabase Edge Function, or an equivalent trusted backend boundary. Private AI provider keys must never appear in mobile applications, generated client code, or committed configuration.
- **Rationale:** Client apps are extractable. Keeping provider keys on the server limits exposure and gives the backend one place to enforce authentication, quotas, and logging.

## ADR-008: Slash-command naming

- **Status:** Accepted
- **Decision:** Every fastAppshipKit command uses the `/ship-` prefix, including `/ship-init`, `/ship-platform`, and `/ship-doctor`. Command names stay the same across supported AI coding agents.
- **Rationale:** A single prefix makes kit commands recognizable and avoids a different command vocabulary for each agent.
