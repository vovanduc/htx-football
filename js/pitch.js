// Render sa bàn: vạch sân (SVG 68x100), token cầu thủ theo slot, đối thủ, bóng, mũi tên.
// Token giữ nguyên DOM theo slot → đổi frame thì CSS transition tự trượt.
import { SLOTS } from './data/roster.js';

const W = 68; // tỉ lệ ngang của viewBox, khớp aspect-ratio 68/100 trong CSS
const SVG_NS = 'http://www.w3.org/2000/svg';

const LINES = `
  <rect x="2" y="2" width="64" height="96" rx="0.5"/>
  <line x1="2" y1="50" x2="66" y2="50"/>
  <circle cx="34" cy="50" r="9"/>
  <circle cx="34" cy="50" r=".5" style="fill:rgba(255,255,255,.8)"/>
  <rect x="14" y="2" width="40" height="16"/>
  <rect x="24" y="2" width="20" height="6"/>
  <circle cx="34" cy="13" r=".5" style="fill:rgba(255,255,255,.8)"/>
  <path d="M27 18 A8 8 0 0 0 41 18"/>
  <rect x="14" y="82" width="40" height="16"/>
  <rect x="24" y="92" width="20" height="6"/>
  <circle cx="34" cy="87" r=".5" style="fill:rgba(255,255,255,.8)"/>
  <path d="M27 82 A8 8 0 0 1 41 82"/>
  <rect x="28" y="0.4" width="12" height="1.6" style="stroke-width:.5"/>
  <rect x="28" y="98" width="12" height="1.6" style="stroke-width:.5"/>
`;

const MARKERS = `
  <defs>
    <marker id="m-run" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" fill="#fff"/>
    </marker>
    <marker id="m-pass" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" fill="#f5c542"/>
    </marker>
  </defs>
`;

const place = (el, [x, y]) => {
  el.style.left = `${x}%`;
  el.style.top = `${y}%`;
};

export function createPitch(root, { onTokenTap } = {}) {
  root.innerHTML = `
    <svg class="lines" viewBox="0 0 ${W} 100" preserveAspectRatio="none" aria-hidden="true">${LINES}</svg>
    <span class="end-label" style="top:3.5%">Khung thành đội bạn</span>
    <span class="end-label" style="bottom:3.5%">Nhà mình</span>
    <svg class="arrows" viewBox="0 0 ${W} 100" preserveAspectRatio="none" aria-hidden="true">${MARKERS}<g></g></svg>
  `;
  const arrowSvg = root.querySelector('svg.arrows');

  const opps = Array.from({ length: 8 }, (_, i) => {
    const d = document.createElement('div');
    d.className = i === 0 ? 'opp gk' : 'opp';
    d.title = i === 0 ? 'Thủ môn đội bạn' : 'Đội bạn';
    root.append(d);
    return d;
  });

  const ball = document.createElement('div');
  ball.className = 'ball';
  ball.textContent = '⚽';
  root.append(ball);

  const tokens = {};
  for (const slot of SLOTS) {
    const b = document.createElement('button');
    b.className = 'token';
    b.dataset.slot = slot;
    b.innerHTML = '<span class="face"><span class="num"></span></span><span class="name"></span>';
    b.addEventListener('click', () => onTokenTap?.(slot));
    root.append(b);
    tokens[slot] = b;
  }

  function render(frame, { lineup, playersById, me, captainId, pickMode = false }) {
    for (const slot of SLOTS) {
      const t = tokens[slot];
      const p = playersById[lineup[slot]];
      const face = t.querySelector('.face');
      face.style.backgroundImage = `url("${p.avatar}")`;
      t.querySelector('.num').textContent = p.number ?? '–';
      t.querySelector('.name').textContent = p.name;
      face.querySelector('.cap')?.remove();
      if (p.id === captainId) face.insertAdjacentHTML('beforeend', '<span class="cap" title="Đội trưởng">C</span>');
      t.classList.toggle('me', p.id === me);
      t.classList.toggle('pick', pickMode);
      t.setAttribute('aria-label', `${p.name}${p.number ? ' số ' + p.number : ''}`);
      place(t, frame.us[slot]);
    }
    frame.them.forEach((pt, i) => place(opps[i], pt));
    place(ball, frame.ball);
    drawArrows(frame);
  }

  function drawArrows(frame) {
    const g = document.createElementNS(SVG_NS, 'g');
    for (const a of frame.arrows) {
      const [x1, y1] = frame.us[a.from];
      const [x2, y2] = a.to;
      const line = document.createElementNS(SVG_NS, 'line');
      line.setAttribute('x1', x1 * W / 100);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', x2 * W / 100);
      line.setAttribute('y2', y2);
      line.setAttribute('class', a.kind);
      line.setAttribute('marker-end', `url(#m-${a.kind})`);
      g.append(line);
    }
    // Thay <g> mới để animation fade-in chạy lại mỗi lần đổi frame.
    arrowSvg.querySelector('g').replaceWith(g);
  }

  return { render };
}
