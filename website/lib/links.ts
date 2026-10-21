export const repositoryUrl = "https://github.com/maaz-bin-hassan/FastAppShip-kit";

export function blobUrl(file: string): string {
  return `${repositoryUrl}/blob/main/${file.split("\\").join("/")}`;
}
