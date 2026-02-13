# Match Runtime

This runtime is responsible for:
- Incrementing match minutes
- Handling half-time
- Handling full-time
- Respecting manual status changes

## What it does NOT do
- Create matches
- Change status manually
- Record goals/events

## Requirements
- Match must already be `live`
- `currentMinute` must be set

## Auto transition thresholds
- Auto half-time happens at `MATCH_FIRST_HALF_AUTO_END_MINUTE` (default `50`)
- Auto full-time happens at `MATCH_SECOND_HALF_AUTO_END_MINUTE` (default `95`)

This allows stoppage time by default. For stricter/manual control, set higher values and use admin controls to move to `half_time` / `finished`.

## How to start
Call `startMatchRuntime()` once when API boots.
