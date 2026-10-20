import type { PermissionCopy, PermissionKind } from "./types.ts";

const ACTIONS = {
  allow: "Allow",
  notNow: "Not now",
  openSettings: "Open Settings",
  checking: "Checking permission…",
} as const;

const EN: Record<PermissionKind, Omit<PermissionCopy, "allow" | "notNow" | "openSettings" | "checking">> = {
  camera: {
    title: "Camera",
    body: "The camera lets you take a photo in the app, for example a profile picture or a scan.",
    deniedTitle: "Camera is off",
    deniedBody: "The camera prompt will not appear again. Turn the camera on in Settings to take a photo.",
  },
  photos: {
    title: "Photos",
    body: "Photo access lets you choose a picture you already have and attach it.",
    deniedTitle: "Photos are off",
    deniedBody: "The photos prompt will not appear again. Turn photo access on in Settings to choose a picture.",
  },
  notifications: {
    title: "Notifications",
    body: "Notifications tell you when something you asked about is ready.",
    deniedTitle: "Notifications are off",
    deniedBody: "The notification prompt will not appear again. Turn notifications on in Settings to get those alerts.",
  },
  location: {
    title: "Location",
    body: "Location lets the app show nearby results and set your place on the map.",
    deniedTitle: "Location is off",
    deniedBody: "The location prompt will not appear again. Turn location on in Settings to see nearby results.",
  },
  microphone: {
    title: "Microphone",
    body: "The microphone lets you record a voice message in the app.",
    deniedTitle: "Microphone is off",
    deniedBody: "The microphone prompt will not appear again. Turn the microphone on in Settings to record.",
  },
  contacts: {
    title: "Contacts",
    body: "Contacts lets you pick a person to invite without typing their details.",
    deniedTitle: "Contacts are off",
    deniedBody: "The contacts prompt will not appear again. Turn contacts on in Settings to pick a person.",
  },
  calendar: {
    title: "Calendar",
    body: "Calendar access lets the app add an event you create to your calendar.",
    deniedTitle: "Calendar is off",
    deniedBody: "The calendar prompt will not appear again. Turn calendar access on in Settings to add the event.",
  },
  bluetooth: {
    title: "Bluetooth",
    body: "Bluetooth lets the app connect to a nearby device it works with.",
    deniedTitle: "Bluetooth is off",
    deniedBody: "The Bluetooth prompt will not appear again. Turn Bluetooth access on in Settings to connect.",
  },
};

const CATALOGS: Record<string, typeof EN> = { en: EN };

export function permissionCopy(kind: PermissionKind, locale = "en"): PermissionCopy {
  const language = locale.toLowerCase().split("-")[0] ?? "en";
  const catalog = CATALOGS[language] ?? EN;
  return { ...catalog[kind], ...ACTIONS };
}
