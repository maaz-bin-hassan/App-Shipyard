import { createElement, type ReactElement } from "react";
import { mockSource, remoteSource, type DataSource } from "../data/source.ts";
import { extendTokens, tokens, type TokenPatch, type ThemeTokens } from "../theme/tokens.ts";
import { Body, Button, Heading, Screen, Stack } from "../ui/components.ts";

export type TextRegion = {
  component: "heading" | "body";
  text: string;
};

export type ButtonRegion = {
  component: "button";
  text: string;
  route?: string;
};

export type StackRegion = {
  component: "stack";
  gap?: string;
  children: Region[];
};

export type Region = TextRegion | ButtonRegion | StackRegion;

export type ScreenDraft = {
  name: string;
  layout: string;
  regions: Region[];
  tokens?: TokenPatch;
  data: DataSource<Record<string, string>>;
  direction?: "ltr" | "rtl";
};

export { mockSource, remoteSource };

function fill(text: string, data: Record<string, string>): string {
  return text.replace(/\{\{([A-Za-z0-9_]+)\}\}/g, (_match, key: string) => {
    if (!Object.prototype.hasOwnProperty.call(data, key)) {
      throw new Error(`No data for ${key}. Use a typed mock or a source the developer named.`);
    }
    return data[key];
  });
}

export function routesIn(regions: readonly Region[]): string[] {
  const routes: string[] = [];
  for (const region of regions) {
    if (region.component === "button" && region.route) routes.push(region.route);
    if (region.component === "stack") routes.push(...routesIn(region.children));
  }
  return routes;
}

export function assertKnownNavigation(regions: readonly Region[], allowed: readonly string[]): void {
  for (const route of routesIn(regions)) {
    if (!allowed.includes(route)) {
      throw new Error(`Refusing navigation to ${route}. The developer did not confirm that route.`);
    }
  }
}

function renderRegion(region: Region, theme: ThemeTokens, data: Record<string, string>, key: string): ReactElement {
  if (region.component === "stack") {
    return createElement(
      Stack,
      { key, gap: region.gap, tokens: theme },
      region.children.map((child, index) => renderRegion(child, theme, data, `${key}.${index}`)),
    );
  }
  if (region.component === "button") {
    return createElement(Button, { key, tokens: theme, route: region.route }, fill(region.text, data));
  }
  const text = fill(region.text, data);
  if (region.component === "heading") return createElement(Heading, { key, tokens: theme }, text);
  return createElement(Body, { key, tokens: theme }, text);
}

export function buildScreen(draft: ScreenDraft, allowedNavigation: readonly string[] = []): ReactElement {
  if (draft.name.trim() === "") throw new Error("A screen needs a name");
  if (draft.layout.trim() === "") throw new Error("Describe the screen layout before building it");
  if (draft.regions.length === 0) throw new Error("A screen needs at least one region");
  assertKnownNavigation(draft.regions, allowedNavigation);
  const theme = extendTokens(tokens, draft.tokens ?? {});
  const data = draft.data.read();
  return createElement(
    Screen,
    { tokens: theme, layout: draft.layout, direction: draft.direction },
    draft.regions.map((region, index) => renderRegion(region, theme, data, String(index))),
  );
}
