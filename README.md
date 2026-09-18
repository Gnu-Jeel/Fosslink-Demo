# Fosslink Demo

A responsive, interactive home automation demo built with plain HTML, CSS, and JavaScript.

## Run locally

Install Node.js (version 18 or later), then run:

```sh
node local-preview.cjs
```

Open <http://127.0.0.1:5173/>. No dependency installation or build step is required.

## Features

- Responsive device and sensor cards with lighting, shades, media, and thermostat controls.
- Eight scenes with cancellation that restores the previous device settings.
- Energy views with illustrative charts and editable rupee cost estimates.
- Protocol and ecosystem integration controls, admin settings, and simulated app sessions.
- Light and dark themes, a Fosslink startup splash, and mobile navigation.
- An in-site visual editor with browser-local drafts and JSON import/export.

All devices, integrations, sessions, and access settings are simulated. This project does not connect to a hub or enforce authentication. Energy readings are sample data, not live measurements. Editor and System settings are stored in the current browser.

## Project structure

- `dist/`: complete static website; edit these files directly.
- `local-preview.cjs`: local development server.
- `test-scenes.cjs`: scene application and restoration checks.
- `.openai/hosting.json`: existing Sites hosting configuration.

Run the scene checks with:

```sh
node test-scenes.cjs
```

To host elsewhere, serve the contents of `dist/` as the website root. Publishing this repository to GitHub does not automatically enable GitHub Pages.

## References

The device inventory and interaction reference is the [Home Assistant demo](https://demo.home-assistant.io/). Integration logo sources are recorded in [SOURCES.md](dist/assets/brands/SOURCES.md). Brand marks belong to their respective owners.
