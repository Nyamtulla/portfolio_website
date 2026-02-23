# Branching Domino Recursion Visualization (Fibonacci)

Static classroom demo for recursion:
- Branching call tree for `fib(n)`
- Distinct call vs return animations
- Naive vs memoized mode
- Manual step-through with a character-style `Next` button
- Click log panel records what happened on each click
- Optional Google Apps Script logging

## Files
- `index.html`
- `style.css`
- `app.js`
- `../gas_logging.gs` (shared optional endpoint for all apps)

## Run Locally
1. Open `index.html` directly in a browser, or serve this folder with any static server.
2. Recommended classroom setting: `n = 5`, `Normal`, `Naive` first, then `Memoized`.

## Controls
- Name / Student ID: required to start
- `n`: slider from 2 to 5
- Mode: `Naive` or `Memoized`
- Name is required to start (attendance)
- `Start`: prepares a run and locks inputs
- `Next`: advances one recursion chunk per click (call + return/compute)
- `Reset`: clears state and unlocks controls

## Logging (Optional)
Logging is off by default.

1. Deploy a Google Apps Script web app using `EECS268LabActivities/gas_logging.gs`.
2. Use the same deployed URL in every app under `EECS268LabActivities`.
3. Each app sends the same schema:
   - `name`, `studentId`, `activity`, `timestamp`
4. `activity` should match the app name (for example, `Process`, `Recursion`).
5. The Google Sheet columns are:
   - `name | studentId | activity | timestamp`

## Notes
- App works offline without external dependencies.
- Memo mode computes first occurrence of each `fib(k)` and reuses cached values on later requests.
