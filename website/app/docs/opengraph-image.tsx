import { getDoc } from "@/lib/docs";
import { ogContentType, ogImage, ogSize } from "@/lib/og";

const page = getDoc("quick-start");

export const dynamic = "force-static";
export const alt = page.title;
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage(page.title);
}
