---
description: Walk a working app to a Google Play internal test. Every console action waits for an explicit yes.
argument-hint: "(none)"
---

## Goal

Take a working app from local assets and listing copy to a release on the Google Play internal testing track. The eight stages are assets, screenshots, listing, signing and build, Play Console setup, first upload, later releases, and a pre-launch checklist. Each stage is a step in `.shipkit/state.json`.

Sizes, click paths, and the first-upload rule are in `docs/play-console-checklist.md`, checked on 2026-10-21. Use that file. When a cited page disagrees with it, follow the page, update the checklist, and then continue.

Creating the Play app, submitting a policy form, uploading a bundle, and rolling out a release are manual. The developer performs each one after an explicit yes. This command ends at internal testing. It does not apply for production.

## Ask

No platform or store questions. Read `platform`, `storeTargets`, and `answers` from `.shipkit/state.json`.

When `storeTargets` does not include `play`, ask nothing. The fragment blocks.

Otherwise ask the rows below once, before Steps. On resume, reuse `answers` and do not ask again. A gate that is not the exact string `yes` is `no` and blocks its stage. The developer sets that answer to `yes` and runs the command again when they are ready.

Reuse `appName`, `applicationId`, `primaryColor`, and `languages`. Map `en` to the Play locale `en-US`, and keep any tag that already names a region. Show that list as `playLocales` for confirmation.

`storeTitle` defaults to `appName` when that name is 30 characters or fewer. `supportEmail` defaults to `privacyContact` when that value contains `@`.

| Id | Question | Record |
| --- | --- | --- |
| `storeTitle` | Store title, 30 characters or fewer. | String. |
| `playLocales` | Play listing locales. | Array of locale ids, including `en-US` when the app has `en`. |
| `iconSource` | Path of a source image for the icon. Leave blank to use a brief. | String. A blank stays blank. |
| `iconBrief` | What should the icon show? Required when `iconSource` is blank. | String. |
| `screenshotStyle` | Phone screenshots: framed inside the required canvas, or raw captures? | `framed` or `raw`. |
| `appKind` | Is the Play app an app or a game? | `app` or `game`. |
| `appPrice` | Free or paid on Play? | `free` or `paid`. |
| `containsAds` | Does the app contain ads? In-app purchases are not ads. | `yes` or `no`. |
| `appAccess` | Is any part of the app behind a login or other restriction? | `open` or `restricted`. |
| `targetAgeGroups` | Which age bands should the target-audience screen select? | Array of age bands. |
| `developerAccountKind` | What kind of Play developer account is this? | `organization`, `personal-on-or-before-2023-11-13`, or `personal-after-2023-11-13`. |
| `supportEmail` | Contact email for the store listing and IARC. | Email string. |
| `privacyPolicyUrl` | Public https URL of the hosted privacy policy. Not a PDF. | URL string. |
| `privacyPolicyReviewed` | Has a person reviewed the privacy draft and approved this URL? | `yes` or `no`. |
| `storeCategory` | Play store category to select. | String. |
| `contentRatingCategory` | IARC questionnaire category to select. | String. A blank stops that screen. |
| `internalTesterEmails` | Internal-test emails. At least one before rollout. | Array of emails. |
| `playAppExists` | Does this package already have a Play Console app? | `yes` or `no`. |
| `firstUploadPath` | First bundle: upload it in Play Console, or use `eas submit` after you have read both EAS pages in the checklist? | `manual` or `eas`. Default `manual`. |
| `cutLaterRelease` | Is this run a later release of an app already on internal testing? | `yes` or `no`. |
| `allowBuild` | May this run produce a production Android App Bundle? | `yes` or `no`. |
| `allowEasCredentials` | May this run let EAS generate or use the Android upload keystore? Flutter and Android native answer `no`. | `yes` or `no`. |
| `allowCreatePlayApp` | May the developer create the Play Console app on Home > Create app? | `yes` or `no`. |
| `allowPlaySetup` | May the developer complete privacy, ads, sign-in, target audience, content rating, Data safety, and the store listing? | `yes` or `no`. |
| `allowInternalUpload` | May the Android App Bundle be uploaded to the internal testing track? | `yes` or `no`. |
| `allowInternalPublish` | May that internal release be rolled out to the internal testers? Closed, open, and production stay off. | `yes` or `no`. |
| `allowServiceAccount` | May a Play service account be created and its JSON key stored outside the repo? | `yes` or `no`. |
| `allowLaterSubmit` | May a later release upload a new bundle to the internal track? | `yes` or `no`. |
| `allowSupplySync` | May Fastlane supply upload listing text and images, with the bundle upload skipped? | `yes` or `no`. |

Ask `approveListingCopy` once, when the listing step shows the draft. Record `yes` only after the developer approves that draft. On resume, reuse it.

Do not ask for a keystore, a password, a service-account JSON, a Play password, or an Expo password. Paths and passwords belong in `.env`.

## Verify

`commands.publish` has steps `1` through `8`. The command is `done` only when steps `1` through `6` and step `8` are `done`, and step `7` is `done` or `skipped`.

The listing icon, feature graphic, adaptive icon, and phone screenshots match the sizes in `docs/play-console-checklist.md`. Title, short description, and full description are within 30, 80, and 4000 characters. `keywords.txt` is present and is not pasted into those three files.

The internal testing track shows the rolled-out release for `answers.applicationId`. The pre-launch checks in the checklist passed for that version. `answers.allowInternalPublish` is `yes`. A draft upload is not enough.

`targetSdkVersion` is 36 or higher. The artifact is an `.aab`.

Every gate used for a console action or a build is the exact string `yes`. The transcript and state file contain no keystore, no service-account JSON, and no values from `.env`.

## Never

Do not create a Play app, submit a form, upload a bundle, roll out a release, or run `eas submit` or `fastlane supply` unless the gate for that action is `yes` and the developer is doing the console click. Do not pass `--auto-submit`. Do not set the Play track to `production`, `beta`, or `alpha`. Do not click Promote release or Apply for production. Do not start the 12-tester closed test.

Do not print or commit a keystore, a keystore password, a service-account JSON, `key.properties`, or `.env`. Do not write those values into state, `eas.json`, or the transcript. Do not download the EAS upload keystore into the repo.

Do not upload a 1024×1024 launcher icon as the 512×512 Play icon. Do not mark a file `done` when its measured size disagrees with the checklist. Do not invent Data safety answers, a content rating, an ads answer, or a test account. Do not declare the privacy draft legal advice or a finished Play submission.

Do not install eas-cli, fastlane, or an SDK unless the developer agrees after you show the install hint. Do not mark a crashed session, a failed paywall check, a dead privacy URL, or a broken listing link as `done`.
