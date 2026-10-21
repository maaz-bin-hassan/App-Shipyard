import { createElement, type ReactNode } from "react";
import { tokens as defaultTokens, type ThemeTokens } from "../theme/tokens.ts";
import { Pressable, Text, View } from "./host.ts";

export const TEMPLATE_COMPONENTS = ["Screen", "Stack", "Heading", "Body", "Button"] as const;

function themeOf(tokens?: ThemeTokens): ThemeTokens {
  return tokens ?? defaultTokens;
}

function space(tokens: ThemeTokens, name: string): number {
  const value = tokens.space[name];
  if (typeof value !== "number") throw new Error(`Missing space token ${name}`);
  return value;
}

export function Screen(props: {
  children?: ReactNode;
  tokens?: ThemeTokens;
  direction?: "ltr" | "rtl";
  layout?: string;
}): ReactNode {
  const theme = themeOf(props.tokens);
  return createElement(
    View,
    {
      direction: props.direction,
      layout: props.layout,
      style: {
        backgroundColor: theme.color.background,
        padding: space(theme, "lg"),
        flexDirection: "column",
      },
    },
    props.children,
  );
}

export function Stack(props: { children?: ReactNode; gap?: string; tokens?: ThemeTokens }): ReactNode {
  const theme = themeOf(props.tokens);
  return createElement(
    View,
    { style: { gap: space(theme, props.gap ?? "md"), flexDirection: "column" } },
    props.children,
  );
}

export function Heading(props: { children?: ReactNode; tokens?: ThemeTokens }): ReactNode {
  const theme = themeOf(props.tokens);
  return createElement(Text, { style: { ...theme.type.heading, color: theme.color.text } }, props.children);
}

export function Body(props: { children?: ReactNode; tokens?: ThemeTokens }): ReactNode {
  const theme = themeOf(props.tokens);
  return createElement(Text, { style: { ...theme.type.body, color: theme.color.text } }, props.children);
}

export function Button(props: { children?: ReactNode; onPress?: () => void; tokens?: ThemeTokens; route?: string }): ReactNode {
  const theme = themeOf(props.tokens);
  return createElement(
    Pressable,
    {
      onPress: props.onPress,
      accessibilityRole: "button",
      accessibilityLabel: props.route,
      style: {
        backgroundColor: theme.color.primary,
        padding: space(theme, "sm"),
      },
    },
    createElement(Text, { style: { ...theme.type.button, color: theme.color.background } }, props.children),
  );
}
