import { languageCode } from "./translate.ts";

const RTL = new Set(["ar", "ur"]);

export type NativeLayout = {
  allowRTL?: (allow: boolean) => void;
  forceRTL: (rtl: boolean) => void;
};

export function directionFor(languageTag: string): "ltr" | "rtl" {
  return RTL.has(languageCode(languageTag)) ? "rtl" : "ltr";
}

export function applyLayoutDirection(languageTag: string, native: NativeLayout): "ltr" | "rtl" {
  const direction = directionFor(languageTag);
  native.allowRTL?.(true);
  native.forceRTL(direction === "rtl");
  return direction;
}

export function layoutDirectionIssue(languageTag: string, direction: string): string | null {
  const expected = directionFor(languageTag);
  if (direction === expected) return null;
  return `${languageCode(languageTag)} should use ${expected} layout`;
}
