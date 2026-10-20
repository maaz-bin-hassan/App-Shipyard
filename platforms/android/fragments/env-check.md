## Preconditions

- `.shipkit/state.json` exists and `platform` is `android`.
- `platforms/android/platform.json` exists and its `envChecks` entries name a JDK and the Android SDK.
- This command only updates `.shipkit/state.json`. Application source is left untouched.

## Steps

1. Read `.shipkit/state.json` and `package.json`. If `commands.env-check.status` is `done` and `kitVersion` matches `package.json` `version`, report that the check already passed and stop.
2. Set `commands.env-check` to `in_progress` and write the current UTC timestamp.
3. For each object in `platforms/android/platform.json` `envChecks`, in order, run `command` and look for `expected` in the combined output. Record that step's status and timestamp. On a mismatch, record `blocked` and include the `install` hint for the current OS in the report. Do not run an installer.
4. Set the command status to `done` when every step matched, otherwise `blocked`, and write the timestamp.

## Rollback

Set `commands.env-check.status` to `blocked` and timestamp it. Do not revert machine-level tools. This command must not have changed them. Leave application files untouched so the failed step statuses can be resumed.
