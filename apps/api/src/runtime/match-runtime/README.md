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

## How to start
Call `startMatchRuntime()` once when API boots.