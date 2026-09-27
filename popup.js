const slider = document.querySelector("#speed");
const value = document.querySelector("#speed-value");
const toggle = document.querySelector("#toggle");
const status = document.querySelector("#status");
let tabId;
let running = false;
let busy = false;
let poll;

function render(state) {
  running = state.running;
  toggle.textContent = running ? "Stop scrolling" : "Start scrolling";
  toggle.dataset.running = String(running);
  status.dataset.error = "false";
  status.textContent = running ? "Scrolling this tab at your pace." : state.reason === "bottom" ? "You’ve reached the bottom of this page." : "Ready when you are.";
}

function unavailable() {
  clearInterval(poll);
  slider.disabled = true;
  toggle.disabled = true;
  toggle.textContent = "Unavailable on this page";
  status.dataset.error = "true";
  status.textContent = "Open a regular webpage and try again. Browser settings, extension stores, and some built-in viewers are restricted.";
}

function send(action, speed) {
  return chrome.tabs.sendMessage(tabId, { target: "autoscroller", action, speed });
}

slider.addEventListener("input", async () => {
  const speed = Number(slider.value);
  value.textContent = `${speed} px/s`;
  // Save immediately so closing the popup doesn't discard the preference.
  chrome.storage.local.set({ speed }).catch(() => {});
  try { render(await send("speed", speed)); } catch { unavailable(); }
});

toggle.addEventListener("click", async () => {
  if (busy) return;
  busy = true;
  toggle.disabled = true;
  try {
    render(await send(running ? "stop" : "start", Number(slider.value)));
    toggle.disabled = false;
  } catch { unavailable(); }
  finally { busy = false; }
});

async function init() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    tabId = tab.id;
    await chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] });
    const state = await send("state");
    const saved = await chrome.storage.local.get("speed");
    const speed = state.running ? state.speed : Number.isFinite(saved.speed) ? Math.max(10, Math.min(300, saved.speed)) : 60;
    slider.value = String(speed);
    value.textContent = `${speed} px/s`;
    render(state);
    slider.disabled = false;
    toggle.disabled = false;
    poll = setInterval(async () => {
      if (busy) return;
      try { render(await send("state")); } catch { unavailable(); }
    }, 350);
  } catch { unavailable(); }
}
init();
