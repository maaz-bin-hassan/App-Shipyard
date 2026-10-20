# Permission screens

Eight pre-permission screens live in this folder. Each one explains the benefit in copy from `i18n.ts`, then offers **Allow** and **Not now**. If the operating system will not ask again, the screen explains that and opens system settings.

There is no slash command. Copy this folder into the app when you are ready to ask for a permission, and pass a `PermissionClient`.

## Screens

| Export | Kind |
| --- | --- |
| `CameraPermissionScreen` | `camera` |
| `PhotosPermissionScreen` | `photos` |
| `NotificationsPermissionScreen` | `notifications` |
| `LocationPermissionScreen` | `location` |
| `MicrophonePermissionScreen` | `microphone` |
| `ContactsPermissionScreen` | `contacts` |
| `CalendarPermissionScreen` | `calendar` |
| `BluetoothPermissionScreen` | `bluetooth` |

`PermissionScreen` takes a `kind` if you would rather use one component. `usePermissionFlow(kind, client)` is the hook those screens use. `phase` is `prompt`, `granted`, `deferred`, `settings`, `loading`, or `error`. `granted` and `deferred` render nothing so the caller can show the feature or move on.

Copy is English. `permissionCopy(kind, locale)` falls back to English for any other language. Add a catalog in `i18n.ts` before shipping another language. The screen reads `title`, `body`, `allow`, `notNow`, and the denied-forever strings from that function. Do not hard-code those sentences in the component.

## Hook

```ts
import { usePermissionFlow } from "./usePermissionFlow.ts";

const flow = usePermissionFlow("camera", client, { locale: "en", analytics });

await flow.allow();
flow.notNow();
await flow.openSettings();
```

`allow` requests the permission. When the status is already `denied-forever`, `allow` opens settings instead of requesting again. `notNow` leaves the status unchanged and sets `phase` to `deferred`.

With an analytics client and consent on, the hook sends `permission_allowed`, `permission_not_now`, or `permission_settings_opened`. The only property is `permission`.

## Expo wiring

`createExpoPermissionClient` maps a `PermissionResponse` (`status`, `granted`, `canAskAgain`) onto `granted`, `undetermined`, `denied`, and `denied-forever`. `canAskAgain: false` is the denied-forever case. Pass `() => Linking.openSettings()` from `react-native` as the settings opener.

Checked against Expo docs on 2026-10-20:

| Kind | Package | Check | Request |
| --- | --- | --- | --- |
| camera | `expo-camera` | `getCameraPermissionsAsync` | `requestCameraPermissionsAsync` |
| photos | `expo-image-picker` | `getMediaLibraryPermissionsAsync` | `requestMediaLibraryPermissionsAsync` |
| notifications | `expo-notifications` | `getPermissionsAsync` | `requestPermissionsAsync` |
| location | `expo-location` | `getForegroundPermissionsAsync` | `requestForegroundPermissionsAsync` |
| microphone | `expo-audio` | `getRecordingPermissionsAsync` | `requestRecordingPermissionsAsync` |
| contacts | `expo-contacts/legacy` | `getPermissionsAsync` | `requestPermissionsAsync` |
| calendar | `expo-calendar` | `getCalendarPermissions` | `requestCalendarPermissions` |
| bluetooth | none in Expo | your module's check | your module's request |

`Contacts.getPermissionsAsync` and `Calendar.getCalendarPermissionsAsync` on the current packages throw. Use the legacy contacts import and the calendar methods without the `Async` suffix.

Expo has no first-party Bluetooth permission module. Supply a `get` and `request` that return the same response shape (Android `BLUETOOTH_CONNECT`, iOS Bluetooth). The screen and the settings link stay the same.

`View`, `Text`, and `Pressable` come from `src/ui/host.ts` so Node can render the screens. In the Expo app, re-export those names from `react-native`.

## Tests

`pnpm test:permissions` covers the hook, the denied-forever settings link, the eight copy variants, and the Expo status mapping.
