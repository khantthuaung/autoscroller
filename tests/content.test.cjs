const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const source = readFileSync(require('node:path').join(__dirname, '../content.js'), 'utf8');

function setup() {
  let listener;
  let id = 0;
  let injections = 0;
  const frames = new Map();
  const events = {};
  const page = { scrollTop: 0, clientHeight: 800, scrollHeight: 10000 };
  const elements = [];
  const makeElement = (tag) => {
    const element = { tag, style: {}, children: [], events: {}, removed: false,
      append(...children) { this.children.push(...children); },
      setAttribute() {}, addEventListener(name, fn) { this.events[name] = fn; },
      remove() { this.removed = true; }, attachShadow() { return makeElement('shadow'); } };
    elements.push(element);
    return element;
  };
  const context = {
    chrome: { runtime: { onMessage: { addListener(fn) { listener = fn; injections++; } } } },
    document: { scrollingElement: page, createElement: makeElement,
      documentElement: makeElement('html'), addEventListener(name, fn) { events[name] = fn; } },
    window: { scrollBy({ top }) { page.scrollTop += top; }, addEventListener(name, fn) { events[name] = fn; } },
    requestAnimationFrame(fn) { frames.set(++id, fn); return id; },
    cancelAnimationFrame(key) { frames.delete(key); }
  };
  runInNewContext(source, context);
  return { page, frames, events, elements,
    inject() { runInNewContext(source, context); return injections; },
    message(action, speed) { let result; listener({ target: 'autoscroller', action, speed }, {}, s => result = s); return result; },
    frame(time) { const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn(time)); }
  };
}

test('speed is based on elapsed time, including fractional movement', () => {
  for (const fps of [60, 120]) {
    const app = setup();
    app.message('start', 10);
    for (let i = 0; i <= fps; i++) app.frame(i * 1000 / fps);
    assert.ok(Math.abs(app.page.scrollTop - 10) <= 1);
  }
});
test('reinjection and repeated starts keep one controller and animation', () => {
  const app = setup();
  assert.equal(app.inject(), 1);
  app.message('start'); app.message('start');
  assert.equal(app.frames.size, 1);
  assert.equal(app.elements.filter(e => e.tag === 'button').length, 1);
});
test('button, Escape, popup stop, and navigation cancel scrolling', () => {
  for (const method of ['button', 'escape', 'popup', 'navigation']) {
    const app = setup(); app.message('start');
    if (method === 'button') app.elements.find(e => e.tag === 'button').events.click();
    if (method === 'escape') app.events.keydown({ key: 'Escape' });
    if (method === 'popup') app.message('stop');
    if (method === 'navigation') app.events.pagehide();
    assert.equal(app.message('state').running, false);
    assert.equal(app.frames.size, 0);
    assert.equal(app.elements.find(e => e.tag === 'div').removed, true);
  }
});
test('bottom of page stops and reports its reason', () => {
  const app = setup(); app.page.scrollTop = 9200;
  app.message('start'); app.frame(0);
  assert.equal(app.message('state').reason, 'bottom');
  assert.equal(app.frames.size, 0);
});
test('speed changes apply live and suspended frames do not cause large jumps', () => {
  const app = setup(); app.message('start', 100); app.frame(0); app.frame(100);
  assert.equal(app.page.scrollTop, 10);
  app.message('speed', 200); app.frame(200);
  assert.equal(app.page.scrollTop, 30);
  app.events.visibilitychange(); app.frame(10000);
  assert.equal(app.page.scrollTop, 30);
  app.frame(20000);
  assert.equal(app.page.scrollTop, 50);
});
