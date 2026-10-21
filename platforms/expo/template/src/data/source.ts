/**
 * A screen reads data through this interface.
 * Use `mockSource` when the developer has not named a real source.
 * Use `remoteSource` only with the evidence they gave. Do not invent a URL.
 */
export type DataSource<T> = {
  kind: "mock" | "remote";
  evidence: string;
  read(): T;
};

export function mockSource<T>(value: T): DataSource<T> {
  return {
    kind: "mock",
    evidence: "typed mock",
    read: () => value,
  };
}

export function remoteSource<T>(evidence: string, read: () => T): DataSource<T> {
  const named = evidence.trim();
  if (named === "") {
    throw new Error("Refusing a data source the developer did not name");
  }
  return { kind: "remote", evidence: named, read };
}
