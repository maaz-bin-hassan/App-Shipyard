import { createElement, type ReactNode } from "react";

type HostProps = {
  children?: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityRole?: "button" | "text";
  style?: Record<string, unknown>;
  direction?: "ltr" | "rtl";
  layout?: string;
};

/**
 * Stand-ins for React Native `View`, `Text`, and `Pressable`.
 * The template stays importable from Node. When this folder is copied into
 * an Expo app, re-export the same names from `react-native`.
 */
function propsFor(props: HostProps): Record<string, unknown> {
  const next: Record<string, unknown> = {};
  if (props.onPress) next.onPress = props.onPress;
  if (props.accessibilityLabel) next.accessibilityLabel = props.accessibilityLabel;
  if (props.accessibilityRole) next.accessibilityRole = props.accessibilityRole;
  if (props.style) next.style = props.style;
  if (props.direction) next.direction = props.direction;
  if (props.layout) next.layout = props.layout;
  return next;
}

export function View(props: HostProps): ReactNode {
  return createElement("View", propsFor(props), props.children);
}

export function Text(props: HostProps): ReactNode {
  return createElement("Text", propsFor(props), props.children);
}

export function Pressable(props: HostProps): ReactNode {
  return createElement("Pressable", propsFor(props), props.children);
}
