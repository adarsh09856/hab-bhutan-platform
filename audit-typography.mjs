import { spawn } from 'child_process';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const fileUrl = 'file:///e:/ai/bhutanprojects/newbend/HAB%20Website.dc.html';
const port = 9222;

console.log('Launching Chrome in headless mode with remote debugging...');
const chrome = spawn(chromePath, [
  '--headless=new',
  `--remote-debugging-port=${port}`,
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  fileUrl
]);

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  let targets = null;
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json`);
      if (res.ok) {
        targets = await res.json();
        break;
      }
    } catch (e) {
      await sleep(300);
    }
  }

  if (!targets || targets.length === 0) {
    console.error('Failed to connect to Chrome DevTools endpoint');
    chrome.kill();
    process.exit(1);
  }

  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  console.log('Target found:', pageTarget.title, pageTarget.url);

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  let id = 1;
  const callbacks = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && callbacks.has(msg.id)) {
      callbacks.get(msg.id)(msg);
      callbacks.delete(msg.id);
    }
  };

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const msgId = id++;
      callbacks.set(msgId, resolve);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  await new Promise(resolve => ws.onopen = resolve);
  console.log('WebSocket connected. Enabling runtime and evaluating computed styles...');

  await send('Runtime.enable');
  await send('Page.enable');

  // Give the page 3 seconds to mount React / support.js and render fonts
  await sleep(3000);

  const evalResult = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const results = [];
        
        function measure(selector, label) {
          const els = document.querySelectorAll(selector);
          els.forEach((el, idx) => {
            const cs = window.getComputedStyle(el);
            results.push({
              label: label + (els.length > 1 ? ' [' + (idx+1) + ']' : ''),
              tag: el.tagName.toLowerCase(),
              textSnippet: el.textContent.trim().slice(0, 50),
              fontFamily: cs.fontFamily,
              fontSize: cs.fontSize,
              fontWeight: cs.fontWeight,
              lineHeight: cs.lineHeight,
              letterSpacing: cs.letterSpacing
            });
          });
        }

        measure('h1', 'H1 Heading');
        measure('h2', 'H2 Heading');
        measure('h3', 'H3 Heading');
        measure('p', 'Paragraph');
        measure('.card-title', 'Card Title');
        measure('nav div', 'Nav Item');
        measure('[style*="IBM Plex Mono"]', 'IBM Plex Mono Eyebrow/Meta');

        return results;
      })()
    `,
    returnByValue: true
  });

  console.log('evalResult keys:', Object.keys(evalResult));
  console.log('evalResult.result:', evalResult.result);
  let output = [];
  if (evalResult.result && evalResult.result.value) {
    output = evalResult.result.value;
  }
  fs.writeFileSync('typography-audit.json', JSON.stringify(evalResult, null, 2));
  console.log('Saved evalResult to typography-audit.json');

  ws.close();
  chrome.kill();
  process.exit(0);
}

run().catch(err => {
  console.error('Error running audit:', err);
  chrome.kill();
  process.exit(1);
});
