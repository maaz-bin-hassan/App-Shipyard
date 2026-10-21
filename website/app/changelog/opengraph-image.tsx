import { ogContentType, ogImage, ogSize } from "@/lib/og";

export const dynamic = "force-static";
export const alt = "Changelog";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage("Changelog");
}
