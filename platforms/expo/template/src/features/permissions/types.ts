export const PERMISSION_KINDS = [
  "camera",
  "photos",
  "notifications",
  "location",
  "microphone",
  "contacts",
  "calendar",
  "bluetooth",
] as const;

export type PermissionKind = (typeof PERMISSION_KINDS)[number];

export type PermissionStatus = "undetermined" | "granted" | "denied" | "denied-forever";

export type PermissionPhase = "loading" | "prompt" | "granted" | "deferred" | "settings" | "error";

export type PermissionClient = {
  getStatus: (kind: PermissionKind) => Promise<PermissionStatus>;
  request: (kind: PermissionKind) => Promise<PermissionStatus>;
  openSettings: () => Promise<void>;
};

export type PermissionCopy = {
  title: string;
  body: string;
  deniedTitle: string;
  deniedBody: string;
  allow: string;
  notNow: string;
  openSettings: string;
  checking: string;
};

export type ExpoPermissionResponse = {
  status?: string;
  granted?: boolean;
  canAskAgain?: boolean;
};

export type ExpoPermissionModule = {
  get: () => Promise<ExpoPermissionResponse>;
  request: () => Promise<ExpoPermissionResponse>;
};
