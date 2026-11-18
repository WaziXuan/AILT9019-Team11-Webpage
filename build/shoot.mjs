// Capture the real app at 3x device pixel density via Chrome DevTools Protocol.
// usage: node shoot.mjs <cdpPort> <appUrl> <outDir>
import { writeFileSync } from "node:fs";
const [port, appUrl, outDir] = process.argv.slice(2);
const sleep = ms => new Promise(r => setTimeout(r, ms));

const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const page = targets.find(t => t.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener("open", r, { once: true }));
let id = 0; const pending = new Map();
ws.addEventListener("message", e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async expr => { const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true }); if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails)); return r.result?.result?.value; };

const W = 820, DPR = 3; const SUF = process.argv[5] || "";
await send("Emulation.setDeviceMetricsOverride", { width: W, height: 1400, deviceScaleFactor: DPR, mobile: false });
await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: SUF ? "dark" : "light" }] });
await send("Page.enable");

async function fresh() { await send("Page.navigate", { url: appUrl }); await sleep(1500); }
async function setCity(c) { await ev(`(()=>{const s=document.getElementById('city');s.value='${c}';s.dispatchEvent(new Event('change',{bubbles:true}));})()`); await sleep(500); }
async function typeQ(t) { await ev(`(()=>{const q=document.getElementById('q');q.focus();q.value=${JSON.stringify(t)};q.dispatchEvent(new Event('input',{bubbles:true}));})()`); await sleep(700); }
async function query() { await ev(`(()=>{const s=document.getElementById('suggestions');if(s)s.hidden=true;document.getElementById('go').click();})()`); await sleep(900); }

// clip from the "Item name" label down to the bottom of `bottomSel`
async function shoot(name, bottomSel, extra = 0) {
  const box = await ev(`(()=>{const q=document.getElementById('q');const lab=[...document.querySelectorAll('label')].find(l=>l.htmlFor==='q'||l.textContent.includes('Item name'))||q;
    const t=lab.getBoundingClientRect(), b=document.querySelector(${JSON.stringify(bottomSel)}).getBoundingClientRect(), wrap=q.closest('main,body').getBoundingClientRect();
    const go=document.getElementById('go').getBoundingClientRect(), L=q.getBoundingClientRect().left, R=Math.max(go.right, document.getElementById('out').getBoundingClientRect().right);
    const x=Math.max(0,L-16);
    return {x, y:t.top+scrollY-12, width:Math.min(${W}-x, R-L+32), height:(b.bottom-t.top)+24+${extra}};})()`);
  const r = await send("Page.captureScreenshot", { format: "png", clip: { ...box, scale: 1 }, captureBeyondViewport: true });
  writeFileSync(`${outDir}/${name}${SUF}.png`, Buffer.from(r.result.data, "base64"));
  console.log(name, Math.round(box.width * DPR) + "x" + Math.round(box.height * DPR));
}

await fresh(); await setCity("shanghai"); await typeQ("plastic bottle"); await query(); await shoot("shanghai_bottle", "#out");
await fresh(); await setCity("hongkong"); await typeQ("plastic bottle"); await query(); await shoot("hongkong_bottle", "#out");
await fresh(); await setCity("hongkong"); await typeQ("膠"); await sleep(600); await shoot("autocomplete", "#suggestions");
await fresh(); await setCity("hongkong"); await typeQ("plastic"); await query(); await shoot("material_only", "#out");
ws.close();
