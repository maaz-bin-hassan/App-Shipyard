export type StoreListing = {
  language: string;
  appName: string;
  shortDescription: string;
  fullDescription: string;
  subtitle?: string;
  storeTargets: readonly ("play" | "appstore")[];
};

const LIMITS = {
  playShort: 80,
  playFull: 4000,
  appStoreSubtitle: 30,
  appStoreFull: 4000,
} as const;

function length(value: string): number {
  return [...value].length;
}

function field(label: string, value: string, limit: number): string[] {
  const text = value.trim();
  const lines = [`${label} (${length(text)}/${limit} characters)`, "", text === "" ? "This field is empty." : text];
  if (text !== "" && length(text) > limit) {
    lines.push("", `Over the ${limit} character limit. Shorten it before submitting.`);
  }
  return lines;
}

export function renderStoreListing(listing: StoreListing): string {
  const lines = [
    `# Store listing (${listing.language})`,
    "",
    `App name: ${listing.appName}`,
    "",
    "Review this text with a native speaker before you submit it. Do not submit it from this command.",
    "",
  ];
  if (listing.storeTargets.includes("play")) {
    lines.push(
      "## Google Play",
      "",
      ...field("Short description", listing.shortDescription, LIMITS.playShort),
      "",
      ...field("Full description", listing.fullDescription, LIMITS.playFull),
      "",
    );
  }
  if (listing.storeTargets.includes("appstore")) {
    lines.push(
      "## App Store",
      "",
      ...field("Subtitle", listing.subtitle ?? listing.shortDescription, LIMITS.appStoreSubtitle),
      "",
      ...field("Description", listing.fullDescription, LIMITS.appStoreFull),
      "",
    );
  }
  return lines.join("\n");
}
