---
description: Draft a privacy policy and Google Play Data safety answers from the code the app actually ships.
argument-hint: "(none)"
---

## Goal

Read the app config permissions, the app dependencies, `docs/events.md`, and the Supabase schema, then write `docs/legal/privacy-policy.md` and `docs/legal/data-safety-answers.md`. The policy starts with a note that it was generated from code, is not legal advice, and must be reviewed. A rerun diffs the previous draft and lists what changed.

## Ask

Ask this once, before Steps. On resume, reuse `answers` and do not ask again.

| Id | Question | Record |
| --- | --- | --- |
| `privacyContact` | What email or URL should people use to ask about their data? Leave this blank if you do not have one yet. | String. A blank stays blank. |

Do not invent a contact when the answer is blank.

## Verify

`docs/legal/privacy-policy.md` begins with the generated-from-code note: it is not legal advice and it must be reviewed. `docs/legal/data-safety-answers.md` answers the Play Data safety form section by section, and each answer cites the file that justifies it.

Every dependency in the app package is named in both files. `unclassified` is empty. Events, schema tables, and declared permissions from the sources are in the policy. `pnpm test:legal` passes.

On a rerun, `docs/legal/changes.md` lists the added and removed lines, or says there were no changes. The first run says there is no previous version.

The transcript and state file contain no secrets. The draft is not submitted to a store.

## Never

Do not call the draft legal advice, an approved policy, or a finished Play Console submission. Do not submit the Data safety form or publish the policy. Do not claim a collection, a sharing practice, encryption, or a deletion path that the cited file does not show. Do not omit a dependency from the app package. Do not invent an SDK the package does not list. Do not print `.env` or secret values. Do not mark a rerun `done` without writing the change list.
