# Autoscroller

A lightweight Chrome / Edge extension that scrolls webpages at your reading pace. Built with vanilla JavaScript, HTML, and CSS. No build step, dependencies, or server.

## Install locally

1. Clone this repository, or download and extract it.
2. Open `chrome://extensions` in Chrome or `edge://extensions` in Edge.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select this repository folder (the one containing `manifest.json`).
5. Pin Autoscroller from the browser's extensions menu for easy access.

After editing the source, click **Reload** on the extension card and refresh the webpage being tested.

## Use

1. Open a regular webpage and click the Autoscroller toolbar icon.
2. Choose a speed from **10–300 pixels per second** and click **Start scrolling**.
3. Close the popup to read. Scrolling continues in that tab.
4. Stop with the floating **Stop scrolling** button, **Escape**, or the popup's Stop button.

Adjust speed while scrolling by reopening the popup. The preferred speed is saved locally; each tab has independent scrolling state. Scrolling stops at the bottom or on navigation. Hidden tabs may be paused by the browser; returning to them does not cause a large catch-up jump.

## Scope and limitations

- Supports the main document's vertical scrolling. Nested scroll panels are not supported yet.
- Stops at the currently available bottom of infinite-scroll pages.
- Browser settings, extension stores, and some built-in viewers prohibit content scripts. The popup explains when a page is unavailable.
- Fullscreen elements and websites using top-layer overlays may cover the floating button; Escape remains available when the page receives the key event.
- Firefox and mobile browsers have not been validated.

## Development

- `manifest.json`: Manifest V3 configuration and permissions.
- `popup.html`, `popup.css`, `popup.js`: controls, saved preferences, and current-tab status.
- `content.js`: page scrolling, isolated floating button, and stop handling.

Run the dependency-free behavior tests with Node.js 18 or later:

```sh
node --test tests/content.test.cjs
```

Manual checks before a release: test long and short pages, very slow and fast speeds, live speed changes, closing/reopening the popup, repeated starts, all stop controls, switching tabs, refreshing/navigating, and restricted pages. Confirm stopping in one tab does not stop another.

## Privacy

Uses `activeTab` and `scripting` to activate on the page you select, and `storage` to remember speed on your device. No analytics, external requests, or page content collection.

## License

MIT — see [LICENSE](LICENSE).
