import type { PermissionCopy, PermissionKind } from "./types.ts";
import { translate } from "../../i18n/translate.ts";

export function permissionCopy(kind: PermissionKind, locale = "en"): PermissionCopy {
  return {
    title: translate(`permissions.${kind}.title`, locale),
    body: translate(`permissions.${kind}.body`, locale),
    deniedTitle: translate(`permissions.${kind}.deniedTitle`, locale),
    deniedBody: translate(`permissions.${kind}.deniedBody`, locale),
    allow: translate("permissions.actions.allow", locale),
    notNow: translate("permissions.actions.notNow", locale),
    openSettings: translate("permissions.actions.openSettings", locale),
    checking: translate("permissions.actions.checking", locale),
  };
}
