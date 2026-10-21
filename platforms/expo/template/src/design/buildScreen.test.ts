Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";
import TestRenderer, { act } from "react-test-renderer";
import { mockSource, remoteSource } from "../data/source.ts";
import { buildScreen } from "./buildScreen.ts";
import { extendTokens, tokens } from "../theme/tokens.ts";
import { Pressable, Text, View } from "../ui/host.ts";

describe("theme tokens", () => {
  it("extends a token and leaves the rest of the theme in place", () => {
    const next = extendTokens(tokens, { color: { primary: "#3366ff" } });
    assert.equal(next.color.primary, "#3366ff");
    assert.equal(tokens.color.primary, "#111111");
    assert.equal(next.color.background, tokens.color.background);
    assert.equal(next.space.md, tokens.space.md);
  });
});

describe("template components", () => {
  it("does not hard-code a colour", async () => {
    const source = await readFile(new URL("../ui/components.ts", import.meta.url), "utf8");
    assert.equal(/#[0-9A-Fa-f]{3,8}/.test(source), false);
  });
});

describe("buildScreen", () => {
  it("builds a screen from template components and typed mock data", async () => {
    const element = buildScreen(
      {
        name: "Home",
        layout: "Heading, then a body line, then a button.",
        tokens: { color: { primary: "#3366ff" } },
        data: mockSource({ title: "Inbox" }),
        regions: [
          { component: "heading", text: "{{title}}" },
          { component: "body", text: "No new items" },
          { component: "stack", gap: "sm", children: [{ component: "button", text: "Open", route: "Inbox" }] },
        ],
      },
      ["Inbox"],
    );
    let renderer!: TestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = TestRenderer.create(element);
    });
    const text = renderer.root.findAllByType(Text).map((node) => String(node.props.children));
    assert.deepEqual(text, ["Inbox", "No new items", "Open"]);
    const screen = renderer.root.findByType(View);
    assert.equal(screen.props.layout, "Heading, then a body line, then a button.");
    assert.equal(screen.props.style.backgroundColor, "#ffffff");
    const button = renderer.root.findByType(Pressable);
    assert.equal(button.props.style.backgroundColor, "#3366ff");
    assert.equal(button.props.accessibilityLabel, "Inbox");
  });

  it("refuses a placeholder the mock does not provide", () => {
    assert.throws(
      () =>
        buildScreen({
          name: "Home",
          layout: "A heading that needs a title.",
          data: mockSource({}),
          regions: [{ component: "heading", text: "{{title}}" }],
        }),
      /No data for title/,
    );
  });

  it("refuses a remote source the developer did not name", () => {
    assert.throws(() => remoteSource("  ", () => ({})), /developer did not name/);
  });

  it("refuses navigation the developer did not confirm", () => {
    assert.throws(
      () =>
        buildScreen({
          name: "Home",
          layout: "A button to settings.",
          data: mockSource({}),
          regions: [{ component: "button", text: "Settings", route: "Settings" }],
        }),
      /developer did not confirm/,
    );
  });
});
