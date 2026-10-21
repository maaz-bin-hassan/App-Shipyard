import { getCommand, loadCommands } from "@/lib/commands";
import { ogContentType, ogImage, ogSize } from "@/lib/og";

export const dynamic = "force-static";

export function generateStaticParams() {
  return loadCommands().map((command) => ({ name: command.name }));
}
export const alt = "Command";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  return ogImage(`ship-${getCommand(name).name}`);
}
