(() => {
  // Injection can happen each time the popup opens. Keep one controller per page.
  if (globalThis.__autoscrollerInstalled) return;
  globalThis.__autoscrollerInstalled = true;

  let running = false;
  let speed = 60;
  let frame = null;
  let previousTime = null;
  let remainder = 0;
  let overlay = null;
  let reason = "ready";

  const state = () => ({ running, speed, reason });
  function stop(nextReason = "stopped") {
    running = false;
    reason = nextReason;
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    previousTime = null;
    remainder = 0;
    overlay?.remove();
    overlay = null;
  }

  function tick(time) {
    if (!running) return;
    const page = document.scrollingElement;
    if (!page || page.scrollTop + page.clientHeight >= page.scrollHeight - 1) {
      stop("bottom");
      return;
    }
    if (previousTime !== null) {
      // Cap gaps after suspended frames; retain fractions for low speeds.
      remainder += speed * Math.min(time - previousTime, 100) / 1000;
      const distance = Math.floor(remainder);
      remainder -= distance;
      if (distance > 0) window.scrollBy({ top: distance, left: 0, behavior: "instant" });
    }
    previousTime = time;
    frame = requestAnimationFrame(tick);
  }

  function start() {
    if (running) return;
    const page = document.scrollingElement;
    if (!page || page.scrollHeight <= page.clientHeight + 1) {
      stop("no-scroll");
      return;
    }
    if (page.scrollTop + page.clientHeight >= page.scrollHeight - 1) {
      stop("bottom");
      return;
    }
    running = true;
    reason = "running";
    overlay = document.createElement("div");
    overlay.style.cssText = "all:initial!important;position:fixed!important;right:24px!important;bottom:24px!important;z-index:2147483647!important;display:block!important;";
    const shadow = overlay.attachShadow({ mode: "closed" });
    const style = document.createElement("style");
    style.textContent = "button{display:flex;align-items:center;gap:9px;border:1px solid #ffffff40;border-radius:999px;padding:14px 20px;background:#182d29;color:#fff;box-shadow:0 5px 24px #0003;font:600 14px system-ui,sans-serif;cursor:pointer}button:hover{background:#304d42}button:focus-visible{outline:3px solid #e9b45b;outline-offset:4px}span{width:9px;height:9px;border-radius:2px;background:#bfe2b8}";
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", "Stop automatic scrolling");
    const square = document.createElement("span");
    square.setAttribute("aria-hidden", "true");
    button.append(square, "Stop scrolling");
    button.addEventListener("click", () => stop());
    shadow.append(style, button);
    document.documentElement.append(overlay);
    frame = requestAnimationFrame(tick);
  }

  chrome.runtime.onMessage.addListener((message, sender, respond) => {
    if (message?.target !== "autoscroller") return;
    if (Number.isFinite(message.speed)) speed = Math.max(10, Math.min(300, message.speed));
    if (message.action === "start") start();
    if (message.action === "stop") stop();
    respond(state());
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && running) stop();
  }, true);
  document.addEventListener("visibilitychange", () => { previousTime = null; });
  window.addEventListener("pagehide", () => stop());
})();
