import type { ExpoPermissionModule, ExpoPermissionResponse, PermissionClient, PermissionKind, PermissionStatus } from "./types.ts";

export function mapExpoStatus(response: ExpoPermissionResponse): PermissionStatus {
  if (response.granted === true || response.status === "granted") return "granted";
  if (response.status === "undetermined") return "undetermined";
  if (response.canAskAgain === false) return "denied-forever";
  return "denied";
}

export function createExpoPermissionClient(
  modules: Record<PermissionKind, ExpoPermissionModule>,
  openSettings: () => Promise<void>,
): PermissionClient {
  return {
    getStatus: async (kind) => mapExpoStatus(await modules[kind].get()),
    request: async (kind) => mapExpoStatus(await modules[kind].request()),
    openSettings,
  };
}
