export type AnalyticsEvent = {
  name: string;
  when: string;
  properties: readonly string[];
};

/**
 * Every product event the template sends. `docs/events.md` is rendered from
 * this list. Add a row here before calling `track` with a new name.
 */
export const EVENTS = [
  {
    name: "permission_allowed",
    when: "The person taps Allow and the operating system grants that permission.",
    properties: ["permission"],
  },
  {
    name: "permission_not_now",
    when: "The person taps Not now on a pre-permission screen.",
    properties: ["permission"],
  },
  {
    name: "permission_settings_opened",
    when: "The person opens system settings after that permission was denied with no further prompt.",
    properties: ["permission"],
  },
  {
    name: "ai_message_sent",
    when: "A signed-in person sends a chat message and the AI proxy accepts it.",
    properties: ["model"],
  },
  {
    name: "ai_completion_requested",
    when: "A signed-in person requests a one-shot completion and the AI proxy accepts it.",
    properties: ["model"],
  },
] as const satisfies readonly AnalyticsEvent[];

export type EventName = (typeof EVENTS)[number]["name"];

export function isEventName(name: string): name is EventName {
  return EVENTS.some((event) => event.name === name);
}

export function renderEventsMarkdown(events: readonly AnalyticsEvent[] = EVENTS): string {
  const rows = events
    .map((event) => `| ${event.name} | ${event.when} | ${event.properties.join(", ")} |`)
    .join("\n");

  return [
    "# Analytics events",
    "",
    "The app sends these events when analytics consent is on. The legal command reads this file. Names match `EVENTS` in `platforms/expo/template/src/lib/events.ts`.",
    "",
    "Screen views use `screen(name)` on the analytics wrapper. Screen names are chosen at the call site, so they are not rows in this table.",
    "",
    "Properties stay coarse. Do not send message text, prompts, email addresses, or the contents of a photo, contact, or calendar event. `model` is an allowlisted model id. `permission` is one of `camera`, `photos`, `notifications`, `location`, `microphone`, `contacts`, `calendar`, or `bluetooth`.",
    "",
    "| Event | When | Properties |",
    "| --- | --- | --- |",
    rows,
    "",
  ].join("\n");
}
