import { createElement, type ReactNode } from "react";
import { PermissionScreen } from "./PermissionScreen.ts";
import type { PermissionClient, PermissionKind } from "./types.ts";
import type { PermissionTracker } from "./usePermissionFlow.ts";

type ScreenProps = {
  client: PermissionClient;
  locale?: string;
  analytics?: PermissionTracker;
};

function screen(kind: PermissionKind, props: ScreenProps): ReactNode {
  return createElement(PermissionScreen, { kind, ...props });
}

export function CameraPermissionScreen(props: ScreenProps): ReactNode {
  return screen("camera", props);
}

export function PhotosPermissionScreen(props: ScreenProps): ReactNode {
  return screen("photos", props);
}

export function NotificationsPermissionScreen(props: ScreenProps): ReactNode {
  return screen("notifications", props);
}

export function LocationPermissionScreen(props: ScreenProps): ReactNode {
  return screen("location", props);
}

export function MicrophonePermissionScreen(props: ScreenProps): ReactNode {
  return screen("microphone", props);
}

export function ContactsPermissionScreen(props: ScreenProps): ReactNode {
  return screen("contacts", props);
}

export function CalendarPermissionScreen(props: ScreenProps): ReactNode {
  return screen("calendar", props);
}

export function BluetoothPermissionScreen(props: ScreenProps): ReactNode {
  return screen("bluetooth", props);
}
