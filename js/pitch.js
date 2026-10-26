// Render sa bàn: vạch sân (SVG 68x100), token cầu thủ theo slot, đối thủ, bóng,
// màn che "loading", dải chú thích và nút xem lại. Token giữ nguyên DOM theo slot →
// đổi vị trí thì CSS transition tự trượt; thời lượng chỉnh theo từng lần di chuyển.
import { SLOTS } from './data/roster.js';

const W = 68; // tỉ lệ ngang của viewBox, khớp aspect-ratio 68/100 trong CSS
const SVG_NS = 'http://www.w3.org/2000/svg';

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

const place = (el, [x, y], ms) => {
  if (ms !== undefined) el.style.transitionDuration = `${ms}ms`;
  el.style.left = `${x}%`;
  el.style.top = `${y}%`;
};

export function createPitch(root, { onTokenTap, onReplay } = {}) {
  root.innerHTML = `
    <svg class="lines" viewBox="0 0 ${W} 100" preserveAspectRatio="none" aria-hidden="true">${LINES}</svg>
    <span class="end-label" style="top:3.5%">Khung thành đội bạn</span>
    <span class="end-label" style="bottom:3.5%">Nhà mình</span>
    <svg class="arrows" viewBox="0 0 ${W} 100" preserveAspectRatio="none" aria-hidden="true">${MARKERS}<g></g></svg>
    <div class="caption" aria-live="polite" hidden></div>
    <button class="replay" hidden>↻ Xem lại</button>
    <div class="curtain" hidden>
      <div class="spin">⚽</div>
      <div class="c-title"></div>
      <div class="c-sub"></div>
      <div class="whistle">Tuýt!</div>
    </div>
  `;
  const caption = root.querySelector('.caption');
  const replay = root.querySelector('.replay');
  const curtain = root.querySelector('.curtain');
  const arrowLayer = root.querySelector('svg.arrows g');
  replay.addEventListener('click', () => onReplay?.());

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

  // Cập nhật mặt/tên theo lineup, không đụng vị trí.
  function dress({ lineup, playersById, captainId, pickMode = false }) {
    for (const slot of SLOTS) {
      const t = tokens[slot];
      const p = playersById[lineup[slot]];
      const face = t.querySelector('.face');
      face.style.backgroundImage = `url("${p.avatar}")`;
      t.querySelector('.num').textContent = p.number ?? '–';
      t.querySelector('.name').textContent = p.name;
      face.querySelector('.cap')?.remove();
      if (p.id === captainId) face.insertAdjacentHTML('beforeend', '<span class="cap" title="Đội trưởng">C</span>');
      t.classList.toggle('pick', pickMode);
      t.setAttribute('aria-label', `${p.name}${p.number ? ' số ' + p.number : ''}`);
    }
  }

  // Đặt toàn bộ sân theo một trạng thái {us, them, ball}.
  function setScene({ us, them, ball: b }, ms) {
    for (const slot of SLOTS) {
      tokens[slot].classList.remove('running');
      place(tokens[slot], us[slot], ms);
    }
    them.forEach((pt, i) => place(opps[i], pt, ms));
    place(ball, b, ms);
  }

  function moveToken(slot, pt, ms) {
    const t = tokens[slot];
    t.classList.add('running');
    place(t, pt, ms);
    setTimeout(() => t.classList.remove('running'), ms);
  }

  function moveBall(pt, ms) {
    place(ball, pt, ms);
  }

  function moveOpps(pts, ms) {
    pts.forEach((pt, i) => place(opps[i], pt, ms));
  }

  // Vẽ mũi tên báo trước hướng di chuyển; mũi tên cũ mờ đi thành vệt.
  function showArrow(from, to, kind) {
    arrowLayer.querySelectorAll('line.live').forEach(l => l.classList.replace('live', 'trail'));
    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('x1', from[0] * W / 100);
    line.setAttribute('y1', from[1]);
    line.setAttribute('x2', to[0] * W / 100);
    line.setAttribute('y2', to[1]);
    line.setAttribute('class', `${kind} live`);
    line.setAttribute('marker-end', `url(#m-${kind})`);
    line.setAttribute('pathLength', '100');
    arrowLayer.append(line);
  }

  function clearArrows() {
    arrowLayer.replaceChildren();
  }

  function highlight(slot) {
    for (const s of SLOTS) tokens[s].classList.toggle('active', s === slot);
  }

  function showCurtain(title, sub) {
    curtain.querySelector('.c-title').textContent = title;
    curtain.querySelector('.c-sub').textContent = sub;
    curtain.hidden = false;
    // Khởi động lại animation CSS mỗi lần hiện.
    curtain.classList.remove('show');
    void curtain.offsetWidth;
    curtain.classList.add('show');
  }

  function hideCurtain() {
    curtain.hidden = true;
  }

  // where: 'top' | 'bottom' — đặt chú thích phía không có người đang chạy.
  function setCaption(html, where = 'bottom') {
    caption.hidden = !html;
    caption.innerHTML = html ?? '';
    caption.classList.toggle('top', where === 'top');
  }

  // corner: 'tl' | 'tr' | 'bl' | 'br' để hiện ở góc đó, falsy để ẩn.
  function showReplay(corner) {
    replay.hidden = !corner;
    if (corner) replay.dataset.corner = corner;
  }

  return { dress, setScene, showArrow, clearArrows, moveToken, moveBall, moveOpps, highlight, showCurtain, hideCurtain, setCaption, showReplay };
}
