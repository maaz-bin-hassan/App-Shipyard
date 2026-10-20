# Analytics events

The app sends these events when analytics consent is on. The legal command reads this file. Names match `EVENTS` in `platforms/expo/template/src/lib/events.ts`.

Screen views use `screen(name)` on the analytics wrapper. Screen names are chosen at the call site, so they are not rows in this table.

Properties stay coarse. Do not send message text, prompts, email addresses, or the contents of a photo, contact, or calendar event. `model` is an allowlisted model id. `permission` is one of `camera`, `photos`, `notifications`, `location`, `microphone`, `contacts`, `calendar`, or `bluetooth`.

| Event | When | Properties |
| --- | --- | --- |
| permission_allowed | The person taps Allow and the operating system grants that permission. | permission |
| permission_not_now | The person taps Not now on a pre-permission screen. | permission |
| permission_settings_opened | The person opens system settings after that permission was denied with no further prompt. | permission |
| ai_message_sent | A signed-in person sends a chat message and the AI proxy accepts it. | model |
| ai_completion_requested | A signed-in person requests a one-shot completion and the AI proxy accepts it. | model |
