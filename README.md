# OneTesselAway

I built a simple real-time transit board based on [OneBusAway](https://onebusaway.org/) and the [Tessel 2](https://tessel.io/). Why? Because I was tired of constantly checking my phone when waiting for the bus every morning.

Here's a photo of the device, which is mounted by my front door. The display shows:

-   Bus 11 is coming in 0 minutes (there now!), in 15 minutes, and in 30 minutes
-   Bus 12 left 3 minutes ago, but others are coming in 14 minutes, and in 29 minutes

<img src="./img/device.jpg" width="250"/>

## Prerequisites

1. Get a OneBusAway API key and put it in `oba-api-key.json` under `apiKey`
2. Install the t2 CLI: https://tessel.gitbooks.io/t2-docs/content/API/CLI.html#installation
3. Install NVM

## Development

Use the latest version of Node supported by the Tessel:

    nvm use

Run the tests:

    npm test

## Web UI

This device includes a web UI where you can view the real-time contents of the display, raw OneBusAway response data, and device logs. By default, it runs on port 8080.

<img src="./img/web-ui.png" width="250"/>

## References

-   https://nodejs.org/docs/latest-v8.x/api/index.html (Latest supported by Tessel 2)
-   https://github.com/mde/ejs/tree/v3.0.1
-   https://github.com/rwaldron/johnny-five/blob/master/docs/lcd-16x2-tessel.md
