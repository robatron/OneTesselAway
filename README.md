# OneTesselAway

I built a simple real-time transit board based on [OneBusAway](https://onebusaway.org/) and the [Tessel 2](https://tessel.io/). Why? Because I was tired of constantly checking my phone when waiting for the bus in the morning.

<img src="./img/prototype-device.jpg" width="250"/>

## Prerequisites

1. Get a OneBusAway API key and put it in `oba-api-key.json` under `apiKey`
2. Install the t2 CLI: https://tessel.gitbooks.io/t2-docs/content/API/CLI.html#installation
3. Install NVM

## Development

Use the latest version of Node supported by the Tessel:

    nvm use

Run the tests:

    npm test

## References

-   https://nodejs.org/docs/latest-v8.x/api/index.html (Latest supported by Tessel 2)
-   https://github.com/mde/ejs/tree/v3.0.1
-   https://github.com/rwaldron/johnny-five/blob/master/docs/lcd-16x2-tessel.md
