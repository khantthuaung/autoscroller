# Chrome Web Store release preparation

Status: release candidate preparation. Real Chrome/Edge testing and listing assets are still required. Passing the simulated behavior tests does not establish store readiness or guarantee approval.

## Listing draft

**Name:** Autoscroller

**Short description:** Read at your own pace with adjustable automatic scrolling and an on-page stop button.

**Description:**

Autoscroller moves long webpages for you, so you can read at a comfortable pace.

- Choose a speed from 10 to 300 pixels per second.
- Adjust your speed while scrolling.
- Stop with the floating page button, Escape, or the extension popup.
- Keep separate scrolling sessions in different tabs.
- Remember your preferred speed on your device.

Open a webpage, click Autoscroller, choose your speed, and press Start scrolling.

Works with the main scrolling area of ordinary webpages. Nested scroll panels and browser-protected pages are not supported. Scrolling stops at the currently loaded bottom of infinite feeds. No account, ads, analytics, or external data transmission.

## Privacy dashboard draft

**Single purpose:** Automatically scroll the active webpage at a user-selected speed, with accessible controls to stop scrolling.

**activeTab justification:** Access the current webpage only when the user invokes the extension, without persistent access to all websites.

**scripting justification:** Inject the scrolling controller and floating Stop button into the selected webpage.

**storage justification:** Store the user's preferred speed locally across popup sessions.

**Remote code:** None. All executable code is packaged with the extension.

**Data collection:** No user data is collected or transmitted by the extension. Review the dashboard's current questions against PRIVACY.md when submitting.

Publish PRIVACY.md at a publicly accessible URL and verify it is accessible while signed out before providing the link in the listing. Verify that GitHub Issues is enabled for the support link.

## Release gates

- [ ] Load unpacked into real Chrome and Edge; check popup and page consoles for errors.
- [ ] Verify normal articles, short pages, bottom-of-page starts, and infinite feeds.
- [ ] Verify slow/fast scrolling, live speed changes, saved preferences, and reopening the popup.
- [ ] Verify floating Stop, Escape, popup Stop, repeat starts, and keyboard-only operation.
- [ ] Verify two independent tabs, background/foreground transitions, reload, navigation, and back/forward.
- [ ] Verify restricted pages display a helpful error.
- [ ] Check the floating button on narrow windows, zoomed pages, and pages with sticky overlays.
- [ ] Capture actual product screenshots and prepare store promotional assets using the current dashboard requirements.
- [ ] Review the name, listing, privacy declarations, support URL, and icon at actual sizes.
- [ ] Register the developer account and complete any account verification requested by Google.
- [ ] Run tests, create the ZIP, and inspect its contents.
- [ ] Upload the ZIP, complete the listing, and submit for store review.

## Package

From the repository root on macOS/Linux:

```sh
node --test tests/content.test.cjs
mkdir -p dist
zip -r dist/autoscroller-0.1.0.zip manifest.json popup.html popup.css popup.js content.js icons
unzip -l dist/autoscroller-0.1.0.zip
```

Only runtime files belong in the upload ZIP. Keep manifest.json at its root. Do not include tests, .git, local files, or signing keys. Increase the manifest version before submitting an update to a previously uploaded version.

Official references: [Publishing](https://developer.chrome.com/docs/webstore/publish), [Account registration](https://developer.chrome.com/docs/webstore/register), [Program policies](https://developer.chrome.com/docs/webstore/program-policies/policies).
