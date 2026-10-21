import { useCallback, useEffect, useState } from "react";
import { useI18n } from "../../i18n/useI18n.ts";
import { translate } from "../../i18n/translate.ts";
import type { EventName } from "../../lib/events.ts";
import { permissionCopy } from "./i18n.ts";
import type {
  PermissionClient,
  PermissionCopy,
  PermissionKind,
  PermissionPhase,
  PermissionStatus,
} from "./types.ts";

export type PermissionTracker = {
  track: (event: EventName, properties?: { permission: PermissionKind }) => void;
};

export type PermissionFlow = {
  status: PermissionStatus | "loading";
  phase: PermissionPhase;
  copy: PermissionCopy;
  errorMessage: string | null;
  allow: () => Promise<void>;
  notNow: () => void;
  openSettings: () => Promise<void>;
};

function phaseFor(status: PermissionStatus): PermissionPhase {
  if (status === "granted") return "granted";
  if (status === "denied-forever") return "settings";
  return "prompt";
}

export function usePermissionFlow(
  kind: PermissionKind,
  client: PermissionClient,
  options?: { locale?: string; analytics?: PermissionTracker },
): PermissionFlow {
  const [status, setStatus] = useState<PermissionStatus | "loading">("loading");
  const [phase, setPhase] = useState<PermissionPhase>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const i18n = useI18n();
  const locale = options?.locale ?? i18n.language;
  const copy = permissionCopy(kind, locale);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setPhase("loading");
    setErrorMessage(null);
    client.getStatus(kind).then(
      (next) => {
        if (cancelled) return;
        setStatus(next);
        setPhase(phaseFor(next));
      },
      (error: unknown) => {
        if (cancelled) return;
        setPhase("error");
        setErrorMessage(error instanceof Error && error.message.trim() !== "" ? error.message : translate("errors.permissionCheck", locale));
      },
    );
    return () => {
      cancelled = true;
    };
  }, [client, kind, locale]);

  const openSettings = useCallback(async () => {
    await client.openSettings();
    options?.analytics?.track("permission_settings_opened", { permission: kind });
  }, [client, kind, options?.analytics]);

  const allow = useCallback(async () => {
    if (phase === "settings" || status === "denied-forever") {
      await openSettings();
      return;
    }
    const next = await client.request(kind);
    setStatus(next);
    setPhase(phaseFor(next));
    setErrorMessage(null);
    if (next === "granted") {
      options?.analytics?.track("permission_allowed", { permission: kind });
    }
  }, [client, kind, openSettings, options?.analytics, phase, status]);

  const notNow = useCallback(() => {
    setPhase("deferred");
    options?.analytics?.track("permission_not_now", { permission: kind });
  }, [kind, options?.analytics]);

  return { status, phase, copy, errorMessage, allow, notNow, openSettings };
}
