# Play Console checklist

Checked against the public docs on 2026-10-21. This file is the source for the publish command's asset checks and for every Play Console screen that command walks through.

Before using a size or a click path, open the cited page. When the page and this file disagree, follow the page, update this file, and then continue. Do not fill a gap from memory.

The publish command stops for an explicit yes before every console action. Nothing in this file is permission to create the app, submit a form, upload a bundle, or roll out a release.

## Asset dimensions

### Play listing icon

[Add preview assets](https://support.google.com/googleplay/android-developer/answer/9866151) requires an app icon to publish the store listing. It does not replace the launcher icon.

[Google Play icon design specifications](https://developer.android.com/distribute/google-play/resources/icon-design-specifications) and the preview-assets page require:

| Check | Value |
| --- | --- |
| Dimensions | 512×512 px |
| Format | 32-bit PNG with alpha |
| Color space | sRGB |
| Maximum file size | 1024 KB |
| Shape | Full square. Play applies the rounded mask. Do not pre-round the corners. |
| Shadow | None. Play applies the shadow. |

Do not put badges, ranking, price, or category text on the icon. The preview-assets page points at the metadata policy for that.

Write this file to `fastlane/metadata/android/<locale>/images/icon.png`. Do not upload the 1024×1024 launcher file as this icon.

### Feature graphic

The same preview-assets page requires a feature graphic:

| Check | Value |
| --- | --- |
| Dimensions | 1024×500 px |
| Format | JPEG, or 24-bit PNG with no alpha |

Keep the focal point in the center. The page's highly recommended list says to avoid a pure white, black, or dark gray background, and to avoid ranking, award, price, and promotional words such as "Best", "#1", "Top", "New", "Free", "Discount", "Sale", and "Million Downloads".

Write this file to `fastlane/metadata/android/<locale>/images/featureGraphic.png`.

### Launcher adaptive icon

This is the icon inside the Android App Bundle. It is a different file from the 512×512 listing icon.

[Adaptive icons](https://developer.android.com/develop/ui/compose/system/icon_design_adaptive) requires a foreground layer and a background layer, each 108×108 dp, plus a monochrome layer when the icon should follow the device theme. The logo must sit inside the center 66×66 dp. The outer area is clipped by the mask.

[AdaptiveIconDrawable](https://developer.android.com/reference/android/graphics/drawable/AdaptiveIconDrawable) describes the same 108×108 dp layers. The inner 72×72 dp is the masked viewport. The outer 18 dp on each side is reserved for the system. Keep essential artwork inside the tighter 66×66 dp zone so a circular mask does not clip it.

[Expo's app config](https://docs.expo.dev/versions/latest/config/app/) recommends a 1024×1024 PNG for `icon` and for `android.adaptiveIcon.foregroundImage`. [Splash screen and app icon](https://docs.expo.dev/develop/user-interface/splash-screen-and-app-icon) says the foreground and the optional background image are PNGs, the background image matches the foreground dimensions, and `backgroundColor` is a `#` plus six hex digits. `monochromeImage` is the Android 13 themed icon.

For an Expo app, write:

| File | Size |
| --- | --- |
| `assets/images/icon.png` | 1024×1024 PNG |
| `assets/images/adaptive-icon.png` | 1024×1024 PNG, mark inside the center 66/108 of the canvas |
| `assets/images/adaptive-monochrome.png` | 1024×1024 PNG, same safe zone |

Point `android.adaptiveIcon.foregroundImage`, `android.adaptiveIcon.monochromeImage`, and `android.adaptiveIcon.backgroundColor` at those files and at `answers.primaryColor`.

For a Flutter or Android native project that already has mipmaps, a bitmap layer at 108 dp is 108 px (mdpi), 162 px (hdpi), 216 px (xhdpi), 324 px (xxhdpi), and 432 px (xxxhdpi). Prefer the vector layers the Android guide describes when the project already uses vectors. Do not add a mipmap set to a project that has no Android directory.

### How to measure a PNG

Read the file. The PNG signature is the first eight bytes. Width is the big-endian uint32 at offset 16. Height is the big-endian uint32 at offset 20. Bit depth is the byte at offset 24. Color type is the byte at offset 25.

| Asset | Pass |
| --- | --- |
| Listing icon | 512×512, bit depth 8, color type 6 (RGBA), file length ≤ 1048576 bytes |
| Feature graphic PNG | 1024×500, bit depth 8, color type 2 (RGB, no alpha) |
| Expo launcher and adaptive layers | 1024×1024 PNG |

A feature graphic with color type 6 fails. Re-export it without alpha. A listing icon that is not color type 6 fails.

## Screenshot files

[Add preview assets](https://support.google.com/googleplay/android-developer/answer/9866151) requires at least two screenshots to publish. Each device type accepts up to eight. The requirement is:

- JPEG or 24-bit PNG, no alpha
- Each side from 320 px to 3840 px
- The long side at most twice the short side

The same page's highly recommended list for apps asks for at least four screenshots at 1080 px or more: 1080×1920 for 9:16 portrait, or 1920×1080 for 16:9 landscape. Taglines, when used, stay within 20% of the image. Captions must not be ranking, award, testimonial, price, or call-to-action text. Clean the status bar: no notifications and no carrier name; battery, Wi-Fi, and cell indicators read as full. The highly recommended list also says to avoid device imagery.

This command's phone export is four 1080×1920 24-bit PNGs (color type 2). That meets the publish requirement and the featuring recommendation. When `answers.screenshotStyle` is `framed`, draw the device frame and the caption inside that canvas. When it is `raw`, export the capture with no frame and no caption. Wear OS screenshots on that page must not use frames; this command produces phone screenshots only.

Capture from an emulator with `adb exec-out screencap -p`. Use an API 36 system image, which is the Play target below. Recapture each `answers.playLocales` entry in that language when the screenshot contains caption text. Write the files to `fastlane/metadata/android/<locale>/images/phoneScreenshots/` as `01.png`, `02.png`, `03.png`, and `04.png` so the order is alphabetical.

[supply](https://docs.fastlane.tools/actions/supply/) replaces the screenshots already on the listing. It does not append.

Alt text is a Play Console field on the graphic, not a file supply uploads. Write each line, 140 characters or fewer, in `docs/play/screenshot-alt-<locale>.md`. The preview-assets page says to skip a prefix such as "image of".

## Listing files

[Create and set up your app](https://support.google.com/googleplay/android-developer/answer/9859152) sets the text limits. The character count treats a full-width character and a half-width character as one character each.

| Field | File | Limit |
| --- | --- | --- |
| App name | `fastlane/metadata/android/<locale>/title.txt` | 30 |
| Short description | `fastlane/metadata/android/<locale>/short_description.txt` | 80 |
| Full description | `fastlane/metadata/android/<locale>/full_description.txt` | 4000 |

Count characters with the code-point length of the trimmed text, and write the file without a trailing newline. The default Play language on that page is English (United States), `en-US`. Map `answers.languages` tag `en` to `en-US`. Keep a tag that already names a region.

[supply](https://github.com/fastlane/fastlane/blob/master/supply/lib/supply.rb) uploads `title`, `short_description`, `full_description`, and `video` only. A third-party copy of the supply docs still says the title limit is 50. Use Google's 30.

Write the ASO working list to `fastlane/metadata/android/<locale>/keywords.txt`, one phrase per line. supply does not upload that file. [Add preview assets](https://support.google.com/googleplay/android-developer/answer/9866151) says extra keywords in the short description do not improve rank. [Create and set up your app](https://support.google.com/googleplay/android-developer/answer/9859152) says repetitive or irrelevant keywords can get the app suspended. Keep the phrases out of `title.txt`, `short_description.txt`, and `full_description.txt`.

Reuse `docs/store/listing-<tag>.md` when translate already wrote it. Shorten any field that is over the limit. Do not add a feature the app does not have.

The short description rules on the preview-assets page also forbid emojis, line breaks, repeated punctuation, and calls to action such as "download now", "install now", "play now", and "try now".

## Values to enter

Use these values when the screen asks for them. Leave a field alone when this table does not name it.

| Screen | Value |
| --- | --- |
| Create app, name | `answers.storeTitle` |
| Create app, default language | The first `answers.playLocales` entry |
| Create app, app or game | `answers.appKind` |
| Create app, free or paid | `answers.appPrice` |
| Create app, contact email | `answers.supportEmail` |
| Privacy policy URL | `answers.privacyPolicyUrl` |
| Ads | `answers.containsAds` |
| Sign-in details | `open`: complete the screen without a test account. `restricted`: the developer types the credentials into Play Console. |
| Target age | `answers.targetAgeGroups` |
| Store category | `answers.storeCategory` |
| Content rating category | `answers.contentRatingCategory` |
| Content rating email | `answers.supportEmail` |
| Data safety | The matching answer in `docs/legal/data-safety-answers.md` |
| Internal testers | `answers.internalTesterEmails` |
| Release track | Internal testing only |

`answers.containsAds` is `No` only when the developer said so and the app dependencies include no ads SDK. In-app purchases are not ads. The examples are on [Prepare your app for review](https://support.google.com/googleplay/android-developer/answer/9859455).

## Create the app

[Create and set up your app](https://support.google.com/googleplay/android-developer/answer/9859152):

1. Open Play Console.
2. Select Home > Create app.
3. Select the default language and enter the app name.
4. Specify app or game.
5. Specify free or paid.
6. Add the contact email.
7. In Declarations, the developer acknowledges Developer Program Policies and US export laws, and accepts the Play App Signing Terms of Service.
8. Select Create app.

Skip this screen when `answers.playAppExists` is `yes`. Package names are permanent and cannot be reused. Do not create a second app for the same package.

The developer clicks every acknowledgement and Create app. The agent does not.

## Privacy policy

[Prepare your app for review](https://support.google.com/googleplay/android-developer/answer/9859455):

1. Open Play Console and go to Policy and programs > App content.
2. Under Privacy Policy, select Start. Select Manage when a policy is already saved.
3. Enter the URL.
4. Save.

[User Data](https://support.google.com/googleplay/android-developer/answer/10144311) requires an active, public, non-geofenced URL. The policy is not a PDF. Enter the URL only after `answers.privacyPolicyReviewed` is `yes`. The draft in `docs/legal/privacy-policy.md` is the text to host. Hosting it is a separate step the developer does before this screen.

Some articles call the same page Policy > App content. Use the label the console shows for App content.

## Ads

[Prepare your app for review](https://support.google.com/googleplay/android-developer/answer/9859455):

1. Policy and programs > App content.
2. Under Ads, select Start. Select Manage when it was already filled in.
3. Select Yes or No from `answers.containsAds`.
4. Save.

## Sign-in details

The same page calls this section Sign-in details. [Target audience and content](https://support.google.com/googleplay/android-developer/answer/9867159) still lists "instructions for app access" as a prerequisite. Use this section for that prerequisite.

1. Policy and programs > App content.
2. Under Sign-in details, select Start. Select Manage when instructions already exist.
3. When `answers.appAccess` is `restricted`, click + Add new instructions. The developer enters the access details, including any one-time password or extra field, in Any other instructions.
4. Save.

When `answers.appAccess` is `open`, do not invent a username or password. If the screen has no way to say that the app is unrestricted, stop and let the developer complete it. Credentials stay in Play Console. Do not copy them into `.shipkit/state.json`, the transcript, or git.

## Target audience and content

[Manage target audience and app content settings](https://support.google.com/googleplay/android-developer/answer/9867159) says to finish ads, app access, and the privacy policy first.

1. Policy > App content.
2. Under Target audience and content, click Start. Click Manage when it was already filled in.
3. Target age: select the bands in `answers.targetAgeGroups`. When a band is not on the screen, stop.
4. The developer answers App details from the app. Do not guess a legal answer.
5. Review the summary and click Save.

When a selected band includes children under 13, stop before Save. That page says those apps must comply with Families policy. This command does not complete Families setup.

## Content rating

[Content ratings](https://support.google.com/googleplay/android-developer/answer/9859655):

1. Policy > App content.
2. Click Start on the content rating questionnaire.
3. Enter `answers.supportEmail` for IARC correspondence.
4. Select `answers.contentRatingCategory` and click Next. When that answer is blank, or the category is not on the screen, stop.
5. The developer completes the questionnaire. Save draft is allowed. Do not invent answers, and do not store the questionnaire in state.
6. On the summary, the developer reviews the calculated ratings and clicks Submit.

## Data safety

[Provide information for Google Play's Data safety section](https://support.google.com/googleplay/android-developer/answer/10787469):

1. Open the App content page.
2. Under Data safety, select Start.
3. Read Overview, then select Next.
4. Data collection and security: select Yes or No from the legal file's answer for whether the app collects or shares required user data types.
5. When the answer is Yes, answer encryption in transit and deletion requests from that same file. The Expo legal draft says encryption is not shown and the deletion answer is No. Select No for those. Do not select Yes for encryption.
6. Select Next.
7. Data types: select only the types the legal file marks as collected or shared. Select Next.
8. Data usage and handling: for each selected type, select Start and enter that type's answers from the legal file. Select Next.
9. Read Store listing preview with the developer.
10. The developer selects Submit, or Save as draft when they are not ready.

`commands.legal` must be `done`, and `docs/legal/data-safety-answers.md` must exist, before this screen. When the legal file says "Not shown" and the form requires a choice, stop. Update the legal draft first.

That page says apps that are only on the internal testing track are exempt from the Data safety section. This command still completes the form, because a later closed or production track needs it. Do not treat the exemption as permission to skip the screen here.

Account creation methods stay unselected when the legal file says no method is shown. [User Data](https://support.google.com/googleplay/android-developer/answer/10144311) requires in-app and web account deletion when the app lets people create an account. Do not declare account creation for the current Expo template.

## Store listing and contact

Graphics and the three text fields live on Main store listing. [Add preview assets](https://support.google.com/googleplay/android-developer/answer/9866151) gives the path Grow users > Store presence > Main store listing, in the Graphics section.

1. Open Grow users > Store presence > Main store listing.
2. Under App details, enter the title, short description, and full description from the locale files.
3. Under Graphics, upload the 512×512 icon, the 1024×500 feature graphic, and the four phone screenshots.
4. Paste the alt text from `docs/play/screenshot-alt-<locale>.md`.
5. When the page asks for a category, select `answers.storeCategory`. The category control is described from the categorization link on [Create and set up your app](https://support.google.com/googleplay/android-developer/answer/9859152). Follow that linked page when the control is not on Main store listing. Do not pick a category the developer did not name.
6. Save.

Add each extra locale from the listing's language control. [Create and set up your app](https://support.google.com/googleplay/android-developer/answer/9859152) says localized graphics are added on the Main store listing page.

Contact email, on that same article:

1. Grow users > Store presence > Store settings.
2. Scroll to Contact Details.
3. Enter `answers.supportEmail`. Add a phone number or website only when the developer supplied one.
4. Save.

On the first journey, upload these files here. Fastlane supply runs in the later-release step, not on this screen.

If News and Magazine apps or COVID-19 contact tracing and status apps is under Needs attention, open it and answer from the app. Do not claim either one for this kit's template. The steps are on [Prepare your app for review](https://support.google.com/googleplay/android-developer/answer/9859455).

## Closed testing for new personal accounts

[App testing requirements for new personal developer accounts](https://support.google.com/googleplay/android-developer/answer/14151465) applies when `answers.developerAccountKind` is `personal-after-2023-11-13`:

- Production and pre-registration stay unavailable until the requirement is met.
- The requirement is a closed test with at least 12 testers opted in continuously for the preceding 14 days.
- Internal testing does not meet that requirement. Open testing becomes available after production access.
- After the closed test qualifies, the developer applies from the Dashboard with Apply for production.

This command does not create that closed test and does not click Apply for production. Organization accounts and personal accounts created on or before 13 November 2023 follow the path Play Console shows for that account. Do not apply the 12-tester rule to them from this page.

Tell a developer with a new personal account that internal testing is the end of this command, and that production is a later decision.

## Internal testing release

[Set up an open, closed, or internal test](https://support.google.com/googleplay/android-developer/answer/9845334):

An internal test can have up to 100 testers. It can start before app setup is finished. Testers are an email list.

Create the list:

1. Test and release > Testing > Internal testing.
2. Open the Testers tab.
3. Under Testers, click Create email list.
4. Enter a list name. Enter `answers.internalTesterEmails`, separated by commas. A CSV puts one address per line and must not be UTF-8 with BOM. Uploading a CSV replaces the list.
5. Click Save changes, then Create.

Add the list:

1. Testers tab.
2. Select that list in the Testers table.
3. Enter a feedback email or URL. Use `answers.supportEmail` when the developer does not supply a different one.
4. Copy the opt-in link only after the release is rolled out.
5. Click Save changes.

[Prepare and roll out a release](https://support.google.com/googleplay/android-developer/answer/9859348):

1. Test and release > Testing > Internal testing.
2. Click Create new release at the top right. When the button is disabled, finish the Dashboard tasks it points at, then return here.
3. Upload the `.aab` when this journey's first-upload path is manual.
4. The developer enters the release name. Use the app version name.
5. Continue to the preview.
6. Roll out only to internal testing.

[Manually submit an Android app](https://docs.expo.dev/submit/android-manual) shows the first-release controls Expo documents: on App integrity, Choose signing key > Google-generated key, then App bundles > Upload, then a release name, Next, and Save and publish. That Save and publish is the internal-track rollout. The Promote release control on the following summary is out of scope. Do not click it.

[App signing security](https://docs.expo.dev/app-signing/security/) says that with Play App Signing, Google holds the app signing key and the upload keystore is the key you can replace. Choose the Google-generated app signing key on the first release. Do not download that key.

Every new upload needs a higher `versionCode`. [Create and set up your app](https://support.google.com/googleplay/android-developer/answer/9859152) rejects a `versionCode` above 2100000000.

## Target API and the bundle

[Target API level requirements](https://support.google.com/googleplay/android-developer/answer/11926878), in force for new apps and updates since 31 August 2026:

- A new phone or tablet app submitted after that date must target Android 16 (API level 36) or higher.
- Wear OS and Android Automotive OS have a lower floor (API 35). Android TV and Android XR have API 34. This command is for a phone app.
- An extension to 1 November 2026 is requested in Play Console. This command does not request it.

The production `.aab` must report `targetSdkVersion` 36 or higher. When the build log does not show that number, stop.

[EAS Submit for Android](https://docs.expo.dev/submit/android/) says Google Play requires an Android App Bundle for a new app. A build profile that sets `android.buildType` to `apk` cannot be submitted.

## First upload

Checked on 2026-10-21. The EAS pages do not agree, so this command does not pretend they do.

[Submit to the Google Play Store](https://docs.expo.dev/submit/android/) says:

> If this is your app's first submission, the default `eas submit` command works out of the box and creates your app's first release on the internal testing track.

The prerequisites on that page are a Play Developer account, an app created in Play Console, and a Google Service Account key uploaded to EAS. The app stays in draft for production until the store listing and setup tasks are done. The same page says a manual upload is the alternative, and `releaseStatus` `draft` uploads without rolling out.

[Manually submit an Android app](https://docs.expo.dev/submit/android-manual) says a manual upload is optional and that `eas submit` can create the first internal release.

[Security](https://docs.expo.dev/app-signing/security/) still says the first Google Play submission needs to be done through the web console, in the section on a compromised service-account key.

`answers.firstUploadPath` chooses:

| Value | What to do |
| --- | --- |
| `manual` | Upload the `.aab` on the internal testing release screen above. Both the submit guide and the security page allow this. This is the default. |
| `eas` | The developer has read both pages. `eas submit --platform android --profile internal` may create the first internal release. The Play app must already exist. |

Creating the app record is manual either way. `eas submit` does not replace Home > Create app.

Do not pass `--auto-submit` on `eas build`. That submits in the same step.

The EAS profile name `production` is the build profile. The Play track is the `track` field. [eas.json](https://docs.expo.dev/eas/json/) lists `track` values `production`, `beta`, `alpha`, and `internal`, and `releaseStatus` values `completed`, `draft`, `halted`, and `inProgress`. This command writes a submit profile named `internal` with `track` `internal`. `releaseStatus` is `draft` until `answers.allowInternalPublish` is `yes`. When both upload and publish are approved, `completed` rolls out that internal release. Never set `track` to `production`, `beta`, or `alpha`.

`serviceAccountKeyPath` may be `$GOOGLE_SERVICE_ACCOUNT_KEY_PATH`. That is the path, not the JSON.

## Service account

Follow [Creating a Google Service Account](https://github.com/expo/fyi/blob/main/creating-google-service-account.md), which the EAS submit page links. Do this only after `answers.allowServiceAccount` is `yes`, and only after the Play app exists so the invite can select that app.

1. Create a Google Cloud project only when the developer does not already have one. Do not enable billing and do not enable APIs the guide does not name.
2. IAM & Admin > Service Accounts > Create Service Account. Name it. Create and close.
3. Manage keys > Create new key > JSON. The developer stores the file outside the repo. The path goes in `.env` as `GOOGLE_SERVICE_ACCOUNT_KEY_PATH`.
4. Enable the Google Play Android Developer API.
5. Play Console > Users and permissions > Invite new users.
6. Enter the service account email. On App permissions, select this app.
7. Select the permissions that guide lists: View app information (read-only); Edit and delete draft apps; Release to production, exclude devices, and use Play App Signing; Release apps to testing tracks; Manage testing tracks and edit tester lists; Manage store presence. Play may also check and grey out View app quality information, Manage policy declarations, and Manage deep links.
8. Invite user.

That guide says Admin, View financial data, Manage orders and subscriptions, and Reply to reviews are not needed. Do not select them. The permission whose label includes "Release to production" is a checkbox on the invite. This command still never rolls out the production track.

Upload the key to EAS only for an Expo app, and only when a later or first `eas submit` is approved:

- Dashboard: Credentials > Android > the application id > Google service account key for EAS Submit > Add a Google service account key > Upload new key > Save.
- Or `eas credentials --platform android`, production build profile, Google Service Account > Manage your Google Service Account Key for Play Store Submissions > Set up a Google Service Account Key, and give the path.

[Submit to the Google Play Store](https://docs.expo.dev/submit/android/) says `--non-interactive` cannot prompt for the key. Assign the key first. Do not print the JSON, and do not pass `json_key_data`.

## Later releases

A later release is a new `versionCode` of an app that already has an internal release. `answers.cutLaterRelease` is `yes` for that run. The first journey skips this stage.

Expo: `eas submit --platform android --profile internal`, with the service account already assigned. Track stays `internal`.

Flutter and Android native: upload that new `.aab` on Test and release > Testing > Internal testing > Create new release. Do not use `eas submit`.

Listing sync, after the binary gate is satisfied, uses supply from the repo root:

```sh
fastlane supply --json_key "$GOOGLE_SERVICE_ACCOUNT_KEY_PATH" --package_name "<applicationId>" --metadata_path fastlane/metadata/android --skip_upload_apk true --skip_upload_aab true --skip_upload_changelogs true
```

[supply](https://docs.fastlane.tools/actions/supply/) defaults `track` to `production` when it uploads a binary. This command skips the APK and the AAB, so supply must not receive an `aab` path. Do not rely on a remembered default. Do not install fastlane in this step unless the developer agrees after you show them the supply docs.

Replace `<applicationId>` with `answers.applicationId`. The shell may expand the path variable. On PowerShell, read the path from `$env:GOOGLE_SERVICE_ACCOUNT_KEY_PATH` and pass that path. Do not echo the JSON file.

## Signing and the production bundle

### Expo

[Submit to the Google Play Store](https://docs.expo.dev/submit/android/) builds the bundle with:

```sh
eas build --platform android --profile production
```

The production profile must produce an `.aab`. Let EAS generate the upload keystore when the app does not have one, and leave it on EAS. [Security](https://docs.expo.dev/app-signing/security/) says that keystore is encrypted on Expo's servers and, with Play App Signing, is the upload key. Do not download it into the repo. If the CLI prints a keystore password, keep it out of the transcript and out of git.

`eas login` uses the developer's Expo account. Do not put that password in state or in the transcript.

### Flutter

From a project that has `pubspec.yaml` and `android/`:

```sh
flutter build appbundle --release
```

### Android native

From a project that has a Gradle wrapper:

```sh
./gradlew :app:bundleRelease
```

The upload keystore for Flutter and Android native stays outside the repo. `ANDROID_KEYSTORE_PATH`, `ANDROID_KEYSTORE_ALIAS`, `ANDROID_KEY_PASSWORD`, and `ANDROID_STORE_PASSWORD` live in `.env`. `key.properties` is gitignored. Do not pass `-storepass` on a command line, and do not copy `keytool` output into the transcript.

## Pre-launch checks

Run these against the same version that was rolled out to internal testing.

| Check | Pass |
| --- | --- |
| Crash-free | The internal build or the release build of that `versionCode` opens, the main path is used, and it leaves no crash dialog. |
| Paywall | When `answers.monetizationModel` is `free`, or paywall was skipped, record the check as not applicable. Otherwise a RevenueCat Test Store or store sandbox purchase unlocks the entitlement, and Restore purchases brings it back. |
| Privacy URL | `GET` `answers.privacyPolicyUrl` returns 200, the content type is not `application/pdf`, and the body is non-empty. |
| Links | Every `http` or `https` URL in `full_description.txt`, plus the privacy URL, returns a status from 200 to 399. |

Do not print `.env` while checking. A failed check leaves the stage blocked.

## Secrets

`.gitignore` already ignores `*.jks`, `*.keystore`, `*.aab`, `credentials.json`, and `service-account.json`. Keep `key.properties`, `play-store-credentials.json`, and `pc-api-*.json` out of git as well.

Never print a keystore, a keystore password, a service-account JSON, a Play password, or an Expo password. Never write them into `.shipkit/state.json`, `eas.json`, or a commit. `eas.json` may contain the literal `$GOOGLE_SERVICE_ACCOUNT_KEY_PATH`.
