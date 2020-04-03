# **WIP:** How it Works

Work-in-progress section documenting how the device and software work.

## Hardware Overview

-   Modules
-   Circuit diagram

### LCD Screen

### Stoplight Module

### Alarm Module

-   Momentary SPST N/O button
-   Piezo speaker
-   Status LED (blue)

## Software Overview

-   Architecture
-   Web UI / Device

## Web UI

-   Simulated hardware
-   Hardware mocking

## Flux-Inspired Data Management

-   Single data store
-   Events (front-end, backend)

### Global State

All data is managed by a global state for the entire app, server and client-side. Anything can update items in the global state, and anything can subscribe to updates to items in the global state.

| Global State Item | Type          | Description                              |
| ----------------- | ------------- | ---------------------------------------- |
| arrivalInfo       | object        | Upcoming bus arrival information         |
| isBuzzerPlaying   | bool          | If the alarm buzzer is currently playing |
| lcdScreenLines    | array<string> | Lines to display on the LCD screen       |
| stoplightState    | string        | State of the 'stoplight' module          |

### Actions

-   action:playAlarm
-   action:updateArrivalInfo

## Simulated hardware in Web UI

## Mock Hardware in Web-Only Mode

Files in [src/hardware/mock-hardware/*] are mocked hardware that can be imported when the device hardware is not present, i.e., when running in "web-only" mode. They simply define the required object, and log info about what _would_ happen if the hardware were present.

## Async Utilities

## Audio Library, Music

-   How audio works (PWM, etc.)
-   LED not working when on pin 6 b/c of PWM
