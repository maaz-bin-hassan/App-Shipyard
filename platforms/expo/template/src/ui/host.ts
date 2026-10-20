import { createElement, type ReactNode } from "react";

type HostProps = {
  children?: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
};

/**
 * Stand-ins for React Native `View`, `Text`, and `Pressable`.
 * The template stays importable from Node. When this folder is copied into
 * an Expo app, re-export the same names from `react-native`.
 */
export function View(props: HostProps): ReactNode {
  return createElement("View", null, props.children);
}

export function Text(props: HostProps): ReactNode {
  return createElement("Text", null, props.children);
}

export function Pressable(props: HostProps): ReactNode {
  return createElement(
    "Pressable",
    { onPress: props.onPress, accessibilityLabel: props.accessibilityLabel },
    props.children,
  );
}
