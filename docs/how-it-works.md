# **WIP:** How it Works

Work-in-progress section documenting how the device and software work

## Hardware Modules

### LCD Screen

### Alarm Module

-   Momentary SPST N/O button
-   Piezo speaker
-   Status LED (blue)

### Stoplight Module

## Flux-Inspired Data Management and events

### Global State

All data is managed by a global state for the entire app, server and client-side. Anything can update items in the global state, and anything can subscribe to updates to items in the global state.

| Global State Item | Type          | Description                              |
| ----------------- | ------------- | ---------------------------------------- |
| arrivalInfo       | object        | Upcoming bus arrival information         |
| isAlarmPlaying    | bool          | If the alarm buzzer is currently playing |
| lcdScreenLines    | array<string> | Lines to display on the LCD screen       |
| stoplightState    | string        | State of the 'stoplight' module          |

### Actions

-   action:playAlarm
-   action:updateArrivalInfo

## Mock Hardware in Web-Only Mode

Files in [src/hardware/mock-hardware/*] are mocked hardware that can be imported when the device hardware is not present, i.e., when running in "web-only" mode. They simply define the required object, and log info about what _would_ happen if the hardware were present.

## Simulated hardware in Web UI
