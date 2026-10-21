## Preconditions

- `.shipkit/state.json` exists and `platform` is `expo`.
- `platforms/expo/template/app.config.ts` and `platforms/expo/template/package.json` exist.
- `docs/events.md` exists. `backend/supabase/migrations` has the schema. `backend/supabase/functions/ai-proxy/handler.ts` exists so message text is not described as a database column.
- `platforms/expo/template/src/legal/evidence.ts` and `platforms/expo/template/src/legal/render.ts` exist.
- Run every command from the repository root.

## Steps

1. Read `.shipkit/state.json` and the kit `package.json`. If the state file is missing, create it with `platform` null, `storeTargets` [], `kitVersion` from `package.json` `version`, `answers` {}, and `commands` {}. Write two-space JSON. If `platform` is not `expo`, set `commands.legal.status` to `blocked` and stop. Load evidence with `loadLegalInputs`. If `commands.legal.status` is `done`, `kitVersion` matches, and both legal files equal `renderPrivacyPolicy` and `renderDataSafety` for this evidence and `answers.privacyContact`, report that the legal draft already matches the code and stop. If the files exist but differ, do not stop; this is a rerun. Otherwise record step `1` as `done`.
2. Set `commands.legal` and step `2` to `in_progress` and write the current UTC timestamp. Write `answers.privacyContact` from Ask, including a blank string. Read `app.config.ts` when the app root has one, otherwise `platforms/expo/template/app.config.ts`. Read dependencies from `platforms/expo/template/package.json` when the root package name is `fastappshipkit`; otherwise read the app `package.json` dependencies. Read `docs/events.md`, every file in `backend/supabase/migrations`, and `backend/supabase/functions/ai-proxy/handler.ts`. Do not read `.env`. Record step `2` as `blocked` when one of those files is missing, otherwise `done`.
3. Render the privacy policy and the Data safety answers. Pass `answers.privacyContact` into `renderPrivacyPolicy`. If `unclassified` is not empty, record step `3` as `blocked`, set `commands.legal.status` to `blocked`, and stop. Name the missing package in the report. When either legal file already exists, build the change list with `renderChanges` against that previous text. When both are missing, `renderChanges(null)` is the change list. Write `docs/legal/privacy-policy.md`, `docs/legal/data-safety-answers.md`, and `docs/legal/changes.md`. The policy's first paragraph is the generated-from-code note. Show the change list in the transcript. Record step `3` as `done`.
4. Run `pnpm test:legal`. The checked-in test renders with a blank `privacyContact`. If `answers.privacyContact` is not blank, the draft correctly includes that contact and the test's expected contact must be the same string before the test can pass. Record step `4` as `blocked` when the test fails, otherwise `done`. Set `commands.legal.status` to `done` only when step `4` is `done` and every dependency is named in both drafts. Write UTC timestamps. Do not open Play Console and do not publish the policy.

## Rollback

Set `commands.legal.status` to `blocked` and timestamp it. Leave the legal drafts and `docs/legal/changes.md` in place so the next run can diff them. Do not delete `.shipkit/state.json`. Do not print secrets.
