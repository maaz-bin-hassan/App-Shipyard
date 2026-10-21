export type TypeStyle = {
  fontSize: number;
  lineHeight: number;
  fontWeight: string;
};

export type ThemeTokens = {
  color: Record<string, string>;
  type: {
    heading: TypeStyle;
    body: TypeStyle;
    button: TypeStyle;
  };
  space: Record<string, number>;
};

export type TokenPatch = {
  color?: Record<string, string>;
  type?: {
    heading?: Partial<TypeStyle>;
    body?: Partial<TypeStyle>;
    button?: Partial<TypeStyle>;
  };
  space?: Record<string, number>;
};

/**
 * Screens read these tokens. Add a key here when a design needs a new colour,
 * type style, or space. Do not hard-code those values in a screen.
 * `color.primary` is replaced from `answers.primaryColor` by the design command.
 */
export const tokens: ThemeTokens = {
  color: {
    primary: "#111111",
    background: "#ffffff",
    text: "#111111",
    textMuted: "#5c6570",
    surface: "#f3f4f6",
  },
  type: {
    heading: { fontSize: 28, lineHeight: 34, fontWeight: "700" },
    body: { fontSize: 16, lineHeight: 24, fontWeight: "400" },
    button: { fontSize: 16, lineHeight: 20, fontWeight: "600" },
  },
  space: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};

export function extendTokens(base: ThemeTokens, patch: TokenPatch = {}): ThemeTokens {
  return {
    color: { ...base.color, ...patch.color },
    type: {
      heading: { ...base.type.heading, ...patch.type?.heading },
      body: { ...base.type.body, ...patch.type?.body },
      button: { ...base.type.button, ...patch.type?.button },
    },
    space: { ...base.space, ...patch.space },
  };
}
