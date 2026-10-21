## Preconditions

- `.shipkit/state.json` exists and `platform` is `ios`.
- `storeTargets` is `appstore`.
- `docs/billing-setup.md` exists.
- Run every command from the repository root.

## Steps

1. Read `.shipkit/state.json` and `package.json`. If the state file is missing, create it with `platform` null, `storeTargets` [], `kitVersion` from `package.json` `version`, `answers` {}, and `commands` {}. Write two-space JSON. If `platform` is not `ios`, set `commands.plan-pricing.status` to `blocked` and stop. If `commands.plan-pricing.status` is `done`, `kitVersion` matches `package.json` `version`, and `docs/monetization.md` exists, report that plan-pricing already finished and stop. Otherwise record step `1` as `done`.
2. Set `commands.plan-pricing` and step `2` to `in_progress` and write the current UTC timestamp. Choose the model with the rules in Goal. Write `docs/monetization.md` with these level-2 sections: Recommended model, Feature gating, Price points, Regional pricing, and Entitlement. Feature gating is a markdown table with columns Feature, Free, and Premium. In Price points, name a primary-market amount. For `subscription`, `trial`, or subscription `freemium`, also name a monthly amount and an annual amount whose per-month cost is lower on the annual plan. For `one-time`, or one-time `freemium`, name one price. For `free`, say there is no price. In Regional pricing, say the App Store price is chosen from Apple's price points and is not copied into the app. For each country in `countryMix` that the answers treat as low-income or price-sensitive, suggest a lower local price than a straight currency conversion and say why. When the mix has no such market, say so. The Entitlement section names one identifier. Read `docs/monetization.md` back. Record step `2` as `blocked` when Recommended model, Feature gating, Price points, Regional pricing, or Entitlement is missing, or when the feature table has no data row. Otherwise record step `2` as `done`.
3. Choose `entitlementId` as lowercase letters, digits, and underscores, or `""` when the model is `free`. Choose `productIds` that match the model: monthly and annual ids for `subscription`, `trial`, and subscription `freemium`; one lifetime id for `one-time` and one-time `freemium`; `[]` for `free`. Use lowercase letters, digits, and underscores in each id. Set `premiumFeatures` to the premium feature names from the table. Write those keys and `audience`, `countryMix`, `appPurpose`, `runCost`, and `monetizationModel` into `answers`. Set `kitVersion` from `package.json`. Write two-space JSON. Change only those `answers` keys and `commands.plan-pricing`. Read the file back. If `monetizationModel`, `entitlementId`, `productIds`, or `premiumFeatures` is missing, or a product id fails the pattern in this step, set step `3` and `commands.plan-pricing.status` to `blocked`. Otherwise set both to `done` with UTC timestamps.

## Rollback

Set `commands.plan-pricing.status` to `blocked` and timestamp it. Leave `docs/monetization.md` in place. Do not delete `.shipkit/state.json`.
