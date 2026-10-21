import { ogContentType, ogImage, ogSize } from "@/lib/og";

export const dynamic = "force-static";
export const alt = "Blog";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage("Blog");
}
