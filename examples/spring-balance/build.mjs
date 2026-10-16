import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as k from '../../vendor/anatomy/kit/iso-kit.mjs';
import { springState, springPresets, springLimits } from './model.mjs';

// Original figure. One world unit along the rail represents one millimetre.
const HERE = new URL('./', import.meta.url);
const read = (relative) => readFileSync(new URL(relative, HERE), 'utf8');
const stripExports = (source) => source.replace(/^export /gm, '');
const W = 780, H = 380;
const BASE = { x: -124, y: -48, w: 294, d: 96, r: 7 };
const P = k.fitProjection([
  ...k.boxCorners(BASE, -16, 32), [194, 0, 25], [-120, 52, 0],
], W, H, { pad: 38, azimuth: 65, elevation: 30 });
const solid = (plan, z, h, tone = 'mid', bevel = 0.7) =>
  k.solidSvg(k.slabOf(plan, z, h, P, 5, bevel), { tone });
const line = (d, tone = 'mid') => k.lineSvg(d, { tone });
const point = (v) => k.iso(v, P);
const dot = (v, size = 1) => k.dotsSvg([point(v)], { size, tone: 'hi' });

function staticMachine() {
  const pieces = [`<path class="iso-halo" d="${k.haloOf(BASE, -16, 12, P)}"/>`];
  const feet = k.corners(BASE, 18).sort((a,b) => k.depthOf([...a,0],P)-k.depthOf([...b,0],P));
  for (const [x,y] of feet) {
    pieces.push(k.solidSvg(k.cylinder(x,y,6,-16,5,P,24),{tone:'lo'}));
  }
  pieces.push(solid(BASE,-11,11,'mid',1.4));
  pieces.push(line(k.planOutline(k.insetPlan(BASE,5),0,P),'lo'));
  for (const [x,y] of k.corners(BASE,10)) {
    pieces.push(line(k.ring(x,y,2.3,0,P),'mid'),dot([x,y,0],0.6));
  }
  for (const y of [-21,17]) {
    pieces.push(solid({x:-78,y,w:226,d:4,r:1},0,4));
    for (const x of [-68,138]) pieces.push(dot([x,y+2,4],0.6));
  }
  pieces.push(solid({x:145,y:-25,w:7,d:50,r:2},0,10));
  for (const y of [-18,18]) pieces.push(dot([148.5,y,10],0.6));
  const ruler = {x:-6,y:32,w:130,d:7,r:0.5};
  pieces.push(solid(ruler,0,0.8,'lo',0));
  const ticks = k.topTicks(-6,114,5,2,32,0.8,[2.5,5],P);
  pieces.push(line(ticks.minor,'lo'),line(ticks.major,'mid'));
  pieces.push(line(k.lineOnTop([-6,28],[-6,41],1,P),'hi'));
  // The fixed anchor and its mounting pad support the spring at y=7, z=20.
  pieces.push(solid({x:-108,y:-26,w:36,d:52,r:3},0,4));
  pieces.push(solid({x:-102,y:-15,w:24,d:30,r:2},4,28,'hi'));
  for (const x of [-104,-76]) for (const y of [-22,22]) pieces.push(dot([x,y,4],0.6));
  pieces.push(line(k.sideRing([-78,7,20],2.5,'x',P),'hi'));
  return pieces.join('');
}

function carriage() {
  const pieces = [solid({x:-18,y:-25,w:24,d:50,r:2},4,6,'hi')];
  pieces.push(solid({x:-18,y:-12,w:24,d:24,r:2},10,18,'hi'));
  pieces.push(solid({x:6,y:4,w:6,d:6,r:1},16,8,'mid'));
  for (const x of [-14,2]) for (const y of [-20,20]) pieces.push(dot([x,y,10],0.7));
  pieces.push(line(k.planOutline({x:-14,y:-8,w:16,d:16,r:1},28,P),'lo'));
  pieces.push(line(k.sideRing([-18,7,20],2.5,'x',P),'hi'));
  return pieces.join('');
}

const initial = springState(6,300);
const initialCoil = k.coil(-78,-18+initial.extensionMm,[0,20],7,9,'x',P,24);
const initialCarriage = k.translateAlong(P,[initial.extensionMm,0,0]);
const initialArrowStart = [12+initial.extensionMm,7,20];
const initialArrowEnd = [initialArrowStart[0]+initial.forceN*3,7,20];
const initialArrow = k.segment(initialArrowStart,initialArrowEnd,P)
  +k.segment([initialArrowEnd[0]-5,4,20],initialArrowEnd,P)
  +k.segment([initialArrowEnd[0]-5,10,20],initialArrowEnd,P);
const initialMeasure = k.segment([-6,43,1],[-6+initial.extensionMm,43,1],P);
const initialCaps = k.segment([-6,40,1],[-6,46,1],P)
  +k.segment([-6+initial.extensionMm,40,1],[-6+initial.extensionMm,46,1],P);
const svg = k.figureSvg({width:W,height:H,label:'理想弹簧：左端固定，右端连接沿轨道移动的滑块。拉力使滑块右移，伸长量从无拉力位置开始测量。',body:[
  staticMachine(),
  `<g data-ref="spring" tabindex="0" role="group" aria-label="弹簧，对应右侧的刚度说明"><path id="coil-back" class="iso-line spring-line" data-tone="hi" d="${initialCoil.back}"/><path id="coil-front" class="iso-line spring-line" data-tone="hi" d="${initialCoil.front}"/></g>`,
  `<g data-ref="carriage" data-part="carriage" tabindex="0" role="group" aria-label="滑块和拉力，对应右侧的拉力说明" transform="${initialCarriage}">${carriage()}</g>`,
  `<g data-ref="carriage" aria-hidden="true"><path id="force-arrow" class="force-arrow" d="${initialArrow}"/></g>`,
  `<g data-ref="extension" tabindex="0" role="group" aria-label="伸长量，从无拉力位置测量"><path id="extension-line" class="measure-line" d="${initialMeasure}"/><path id="extension-caps" class="measure-line" d="${initialCaps}"/></g>`,
]}).replace('role="img"','role="group"');

const presets = springPresets.map(p=>`<button type="button" data-preset="${p.id}" aria-pressed="${p.id==='baseline'}" disabled>${p.label}</button>`).join('');
const controls = `<section class="controls" aria-label="改变弹簧参数">
  <div class="control-row"><label for="force">拉力 F <output id="force-value" for="force">6.0 N</output></label><input id="force" type="range" min="${springLimits.forceMin}" max="${springLimits.forceMax}" step="${springLimits.forceStep}" value="6" aria-describedby="force-help" disabled><p id="force-help">向右拉的力，范围 0–12 N。</p></div>
  <div class="control-row"><label for="stiffness">刚度 k <output id="stiffness-value" for="stiffness">300 N/m</output></label><input id="stiffness" type="range" min="${springLimits.stiffnessMin}" max="${springLimits.stiffnessMax}" step="${springLimits.stiffnessStep}" value="300" aria-describedby="stiffness-help" disabled><p id="stiffness-help">刚度越大，弹簧越难拉长，范围 100–600 N/m。</p></div>
  <div class="presets" aria-label="比较四种情况">${presets}</div>
</section>`;

const css = `
${k.ISO_CSS}
*{box-sizing:border-box}:root{color-scheme:light;--pe-accent:#226c50;--pe-tint:#e4f0dc}body{margin:0;font:16px/1.7 system-ui,-apple-system,"Segoe UI",sans-serif;background:#f5f4ef;color:#242827}main{max-width:1180px;margin:0 auto;padding:48px 28px 36px}h1{font-size:clamp(26px,3.6vw,44px);line-height:1.28;letter-spacing:-.035em;max-width:820px;margin:14px 0 16px}h2{font-size:20px;line-height:1.4;margin:0 0 18px}.eyebrow{font:12px/1.5 ui-monospace,monospace;letter-spacing:.12em;color:#496557}.lead{max-width:760px;font-size:18px;margin:0 0 30px;color:#4b554e}.layout{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(280px,1fr);grid-template-areas:"figure explanation" "controls explanation";column-gap:28px;row-gap:0;align-items:start}.machine{grid-area:figure;min-width:0;border:1px solid #b7c1b8;background:#fbfbf7;border-radius:14px;margin:0;overflow:hidden}.figure-top{display:flex;justify-content:space-between;gap:12px;padding:17px 20px 0;font-size:12px;color:#526259}.figure-top strong{font-size:13px;color:#253c2e}.iso-stage{padding:0 10px}.iso-svg{width:100%;height:auto;overflow:hidden}.spring-line{stroke-width:1.45}.force-arrow{fill:none;stroke:#1b7054;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}.measure-line{fill:none;stroke:#9a5a24;stroke-width:1.5;stroke-linecap:round}.caption{font-size:13px;color:#4e5b52;padding:12px 20px 18px;border-top:1px solid #dce1d7}.controls{grid-area:controls;padding:22px 0 0}.control-row{margin:0 0 18px}.control-row label{display:flex;justify-content:space-between;gap:16px;font-weight:650;font-size:15px}output{font-variant-numeric:tabular-nums}.control-row output{color:#1b684c;font:600 16px/1.7 ui-monospace,monospace}input[type=range]{width:100%;min-height:28px;margin:8px 0 0;accent-color:#226c50;cursor:pointer}.control-row p{font-size:12px;color:#57635b;margin:0}.presets{display:flex;flex-wrap:wrap;gap:8px}button{font:inherit;font-size:13px;border:1px solid #c0c9bf;border-radius:7px;padding:8px 12px;background:#fff;color:#283e2f;cursor:pointer}button[aria-pressed=true]{background:#204f3a;color:#fff;border-color:#204f3a}button:hover{border-color:#204f3a}:focus-visible{outline:3px solid #b3751d;outline-offset:4px}.explanation{grid-area:explanation;padding:23px 24px;background:#fff;border:1px solid #d8dfd6;border-radius:14px}.result-label{font-size:13px;color:#5d685f;margin:0}.result{display:block;font:500 clamp(35px,4vw,51px)/1.25 ui-monospace,monospace;letter-spacing:-.055em;color:#1d5b42;margin:8px 0 14px}.equation{font:14px/1.8 ui-monospace,monospace;background:#f0f4ed;padding:12px;border-radius:7px;overflow-wrap:anywhere}.meaning{margin:22px 0 0}.meaning dt{font-size:14px;font-weight:700}.meaning dd{font-size:14px;margin:4px 0 17px;color:#49564c}.meaning dd:last-child{margin-bottom:0}.meaning [data-ref]{border-radius:4px}#narrative{font-size:14px;margin:17px 0 0}.boundary{border-top:1px solid #d4dcd2;margin-top:30px;padding-top:20px;color:#4d5b50;font-size:13px;display:grid;grid-template-columns:1fr 1fr;gap:22px}.boundary p{margin:0}.boundary strong{color:#2c3e30}footer{font-size:12px;color:#59665d;margin-top:24px}a{color:#2a634a;text-underline-offset:3px}.iso-svg [data-ref-active] .iso-line{stroke:#176b4f!important;stroke-width:2.6}.iso-svg [data-ref-active] .iso-edge{stroke:#176b4f!important;stroke-width:1.8}.iso-svg [data-ref-active] .measure-line{stroke-width:3}.explanation [data-ref-active]{background:#e4f0dc;box-shadow:0 0 0 4px #e4f0dc}.noscript{background:#fff5d7;border:1px solid #bea660;padding:12px;border-radius:7px;font-size:14px}@media(max-width:800px){main{padding:30px 20px}.layout{grid-template-columns:1fr;grid-template-areas:"figure" "explanation" "controls";gap:22px}.controls{padding-top:0}.explanation{padding:22px}.boundary{grid-template-columns:1fr;gap:12px}.lead{font-size:16px}.iso-stage{padding:0}.figure-top{padding:14px 14px 0}.caption{padding:12px 14px;font-size:12px}}@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}
`;

const live = `
const springProjection = ${JSON.stringify(P)};
const forceInput = document.querySelector('#force');
const stiffnessInput = document.querySelector('#stiffness');
const fixedPoint = iso([-6,43,1],springProjection);
const svgRoot = document.querySelector('.iso-svg');
function updateSpring() {
  const state = springState(Number(forceInput.value),Number(stiffnessInput.value));
  const x = state.extensionMm;
  const c = coil(-78,-18+x,[0,20],7,9,'x',springProjection,24);
  document.querySelector('#coil-back').setAttribute('d',c.back);
  document.querySelector('#coil-front').setAttribute('d',c.front);
  document.querySelector('[data-part="carriage"]').setAttribute('transform',translateAlong(springProjection,[x,0,0]));
  const arrowStart = [12+x,7,20], arrowEnd = [12+x+state.forceN*3,7,20];
  const forcePath = state.forceN === 0 ? '' : segment(arrowStart,arrowEnd,springProjection)+segment([arrowEnd[0]-5,arrowEnd[1]-3,20],arrowEnd,springProjection)+segment([arrowEnd[0]-5,arrowEnd[1]+3,20],arrowEnd,springProjection);
  document.querySelector('#force-arrow').setAttribute('d',forcePath);
  const endPoint = iso([-6+x,43,1],springProjection);
  document.querySelector('#extension-line').setAttribute('d',pathOf([fixedPoint,endPoint]));
  document.querySelector('#extension-caps').setAttribute('d',segment([-6,40,1],[-6,46,1],springProjection)+segment([-6+x,40,1],[-6+x,46,1],springProjection));
  document.querySelector('#force-value').textContent = state.forceN.toFixed(1)+' N';
  document.querySelector('#stiffness-value').textContent = state.stiffnessNm+' N/m';
  document.querySelector('#extension-value').textContent = x.toFixed(1)+' mm';
  document.querySelector('#equation').textContent = 'x = '+state.forceN.toFixed(1)+' / '+state.stiffnessNm+' ≈ '+state.extensionM.toFixed(4)+' m';
  document.querySelector('#force-meaning').textContent = '滑块受到向右 '+state.forceN.toFixed(1)+' N 的拉力。绿色箭头表示它的方向和大小。';
  document.querySelector('#stiffness-meaning').textContent = 'k = '+state.stiffnessNm+' N/m。在这个理想模型中，每多伸长 1 mm，需要多 '+(state.stiffnessNm/1000).toFixed(3)+' N 的拉力。';
  document.querySelector('#extension-meaning').textContent = 'x = '+x.toFixed(1)+' mm。棕色线段从无拉力时的零位量起，不是弹簧的总长度。';
  document.querySelector('#narrative').textContent = state.forceN === 0 ? '没有拉力时，伸长为 0 mm。弹簧仍有自身的长度。' : '当前静止在平衡位置：弹簧向左的回复力与向右的拉力大小相等。';
  forceInput.setAttribute('aria-valuetext',state.forceN.toFixed(1)+' 牛顿');
  stiffnessInput.setAttribute('aria-valuetext',state.stiffnessNm+' 牛顿每米');
  svgRoot.setAttribute('aria-label','左端固定的弹簧。拉力 '+state.forceN.toFixed(1)+' 牛顿，刚度 '+state.stiffnessNm+' 牛顿每米，伸长 '+x.toFixed(1)+' 毫米。');
  for (const b of document.querySelectorAll('[data-preset]')) {
    const p = springPresets.find(p=>p.id===b.dataset.preset);
    b.setAttribute('aria-pressed',String(p.forceN===state.forceN&&p.stiffnessNm===state.stiffnessNm));
  }
}
forceInput.addEventListener('input',updateSpring);
stiffnessInput.addEventListener('input',updateSpring);
for (const button of document.querySelectorAll('[data-preset]')) {
  button.addEventListener('click',()=>{const p=springPresets.find(p=>p.id===button.dataset.preset);forceInput.value=p.forceN;stiffnessInput.value=p.stiffnessNm;updateSpring();});
}
wireReferences(document.querySelector('main'));
updateSpring();
for (const control of document.querySelectorAll('.controls input, .controls button')) control.disabled = false;
`;

const script = [
  stripExports(read('../../vendor/anatomy/kit/iso-kit.mjs')),
  stripExports(read('./model.mjs')),
  stripExports(read('../../assets/paired-explainer/paired-explainer.mjs')),
  live,
].join('\n');
const page = `<!doctype html>
<!-- Original example. Runtime includes the Anatomy SVG core.
${read('../../vendor/anatomy/LICENSE')}
Paired explanation patterns adapted from visual-explainer:
${read('../../vendor/visual-explainer/LICENSE')}
Original example and paired-explainer module:
${read('../../LICENSE')}
-->
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>拉力与伸长 · Explain with Models</title><style>${read('../../assets/paired-explainer/paired-explainer.css')}\n${css}</style></head>
<body class="iso" data-theme="light"><main>
<header><div class="eyebrow">EXPLAIN WITH MODELS / 02 · 理想弹簧</div><h1>同样的弹簧，拉力越大，伸长越多。</h1><p class="lead">保持刚度不变，把拉力加倍，伸长也会加倍。改变下面的参数，看同一条公式如何改变装置和解释。</p></header>
<noscript><p class="noscript">当前显示 6 N、300 N/m 的静态示例，伸长为 20 mm。交互需要 JavaScript。</p></noscript>
<div class="layout"><figure class="machine"><div class="figure-top"><strong>01 / 左端固定，右端可移动</strong><span>静态平衡</span></div><div class="iso-stage">${svg}</div><figcaption class="caption">滑块沿轨道右移。棕色线段显示伸长，绿色箭头显示拉力。悬停或用 Tab 聚焦图和文字，可找到对应部分。</figcaption></figure>
<aside class="explanation" aria-labelledby="explanation-title"><h2 id="explanation-title">公式如何解释当前状态</h2><p class="result-label">伸长量 x</p><output id="extension-value" class="result" for="force stiffness" aria-live="polite" aria-atomic="true">20.0 mm</output><div class="equation"><div>F = kx → x = F / k</div><div id="equation">x = 6.0 / 300 ≈ 0.0200 m</div></div><dl class="meaning"><dt><span data-ref="carriage" tabindex="0">1. 拉力 F：我们施加的力</span></dt><dd id="force-meaning">滑块受到向右 6.0 N 的拉力。绿色箭头表示它的方向和大小。</dd><dt><span data-ref="spring" tabindex="0">2. 刚度 k：弹簧有多难拉长</span></dt><dd id="stiffness-meaning">k = 300 N/m。在这个理想模型中，每多伸长 1 mm，需要多 0.300 N 的拉力。</dd><dt><span data-ref="extension" tabindex="0">3. 伸长 x：比原来多出的长度</span></dt><dd id="extension-meaning">x = 20.0 mm。棕色线段从无拉力时的零位量起，不是弹簧的总长度。</dd></dl><p id="narrative">当前静止在平衡位置：弹簧向左的回复力与向右的拉力大小相等。</p></aside>${controls}</div>
<section class="boundary" aria-label="模型边界和阅读方式"><p><strong>这是一个简化模型。</strong>它采用胡克定律 F = kx，假设弹簧理想且线性、轨道无摩擦。它只显示静止后的平衡位置，不模拟振动、屈服或断裂。改变 k 等于更换理想弹簧；外形不表示真实材料尺寸。</p><p><strong>自己核对两次。</strong>点击「拉力加倍」，伸长应从 20 mm 变为 40 mm。点击「刚度加倍」，伸长应为 10 mm。用 Tab 选择滑块，再按方向键，数值、图和文字应同步改变。</p></section>
<footer>模型：牛顿（N）表示力，米（m）表示长度，1 m = 1000 mm。F 表示拉力的大小。<br>绘图使用 Anatomy SVG core；文字与图的对应由本项目的 paired-explainer 模块提供。无需网络或外部字体。</footer>
</main><script type="module">${script.replace(/<\/(script)/gi,'<\\/$1')}</script></body></html>\n`;
writeFileSync(new URL('index.html',HERE),page);
console.log(`Built ${fileURLToPath(new URL('index.html',HERE))} (${Buffer.byteLength(page)} bytes)`);
