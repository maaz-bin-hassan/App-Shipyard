export function parseSemver(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(value);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

export function compareSemver(left, right) {
  const a = parseSemver(left);
  const b = parseSemver(right);
  if (!a || !b) {
    throw new Error(`Not a major.minor.patch version: ${!a ? left : right}`);
  }
  for (let index = 0; index < 3; index += 1) {
    if (a[index] !== b[index]) return a[index] < b[index] ? -1 : 1;
  }
  return 0;
}

export function changelogVersions(markdown) {
  const versions = [];
  for (const line of String(markdown).split(/\r?\n/)) {
    const match = /^## \[(\d+\.\d+\.\d+)\]/.exec(line);
    if (match) versions.push(match[1]);
  }
  return versions;
}

export function resolveLatest(packageVersion, changelog) {
  if (!parseSemver(packageVersion)) {
    throw new Error(`Not a major.minor.patch version: ${packageVersion}`);
  }
  let latest = packageVersion;
  for (const version of changelogVersions(changelog)) {
    if (compareSemver(version, latest) > 0) latest = version;
  }
  return latest;
}

export function migrationsToApply(kitVersion, latest, filenames) {
  if (!parseSemver(kitVersion) || !parseSemver(latest)) {
    throw new Error("kitVersion and latest must be major.minor.patch");
  }
  return filenames
    .map((name) => {
      const match = /^(\d+\.\d+\.\d+)\.md$/.exec(name);
      return match ? match[1] : null;
    })
    .filter((version) => version && compareSemver(version, kitVersion) > 0 && compareSemver(version, latest) <= 0)
    .sort(compareSemver);
}

export function planUpdate({ kitVersion, packageVersion, changelog, migrationFilenames }) {
  const latest = resolveLatest(packageVersion, changelog);
  const ahead = compareSemver(kitVersion, latest) > 0;
  return {
    kitVersion,
    latest,
    ahead,
    migrations: ahead ? [] : migrationsToApply(kitVersion, latest, migrationFilenames),
  };
}
