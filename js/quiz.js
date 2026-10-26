// Thử thách "Đứng đúng chỗ": random frame + slot, kéo token về đúng vị trí rồi chấm điểm.
import { SLOTS, SLOT_LABELS } from './data/roster.js';
import { allFrames } from './data/tactics.js';
import { distance, scoreDrop, clampPoint } from './engine.js';

const START = [50, 50];
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

export function createQuiz({ pitch, bar, info, getCtx, renderFrame }) {
  let round = null;
  let total = 0;
  let played = 0;
  let abort = null;

  function next() {
    const { lineup, me } = getCtx();
    const mySlot = SLOTS.find(s => lineup[s] === me);
    const { label, frame } = pick(allFrames());
    // Có chọn "Tôi là" thì 2/3 số câu hỏi về chính vị trí của mình.
    const slot = mySlot && Math.random() < 0.67 ? mySlot : pick(SLOTS);
    round = { label, frame, slot, done: false };
    pitch.clearGhost();
    renderFrame(frame, { showArrows: false });
    const token = pitch.tokens[slot];
    pitch.place(token, START);
    token.classList.add('pick');
    bindDrag(token);
    paint();
  }

  function bindDrag(token) {
    abort?.abort();
    abort = new AbortController();
    const { signal } = abort;
    let dragging = false;
    token.addEventListener('pointerdown', e => {
      if (round.done) return;
      dragging = true;
      token.setPointerCapture(e.pointerId);
      token.classList.add('dragging');
      e.preventDefault();
    }, { signal });
    token.addEventListener('pointermove', e => {
      if (!dragging) return;
      pitch.place(token, clampPoint(pitch.toPct(e.clientX, e.clientY)));
    }, { signal });
    const end = e => {
      if (!dragging) return;
      dragging = false;
      token.classList.remove('dragging');
      submit(clampPoint(pitch.toPct(e.clientX, e.clientY)));
    };
    token.addEventListener('pointerup', end, { signal });
    token.addEventListener('pointercancel', () => { dragging = false; token.classList.remove('dragging'); }, { signal });
  }

  function submit(drop) {
    const target = round.frame.us[round.slot];
    const result = scoreDrop(distance(drop, target));
    round.done = true;
    round.result = result;
    played += 1;
    total += result.points;
    pitch.tokens[round.slot].classList.remove('pick');
    pitch.showGhost(target);
    // Hiện lại mũi tên để thấy cả đội di chuyển thế nào.
    renderFrame(round.frame, { showArrows: true });
    pitch.place(pitch.tokens[round.slot], drop);
    setTimeout(() => round?.done && pitch.place(pitch.tokens[round.slot], target), 900);
    paint();
  }

  function paint() {
    const { lineup, playersById } = getCtx();
    const p = playersById[lineup[round.slot]];
    bar.hidden = false;
    bar.innerHTML = `
      <div class="q">${round.done ? 'Điểm phiên này' : `Kéo <b>${p.name}</b> về đúng chỗ`}</div>
      <div class="score">${total} <small style="font-size:12px;color:var(--muted)">/ ${played * 100}</small></div>
    `;
    const res = round.result;
    const cls = !res ? '' : res.points >= 100 ? 'good' : res.points >= 40 ? 'ok' : 'bad';
    info.innerHTML = `
      <div class="card">
        <div class="meta"><span>🎯 Thử thách đứng đúng chỗ</span></div>
        <h2>${round.label}</h2>
        <p>${p.name} đang đá <b>${SLOT_LABELS[round.slot]}</b>. Nhìn vị trí bóng (⚽), đội bạn (chấm đỏ) và đồng đội, rồi kéo ${p.name} tới chỗ đúng.</p>
      </div>
      ${res ? `
        <div class="card">
          <p class="verdict ${cls}">${res.verdict} · +${res.points}</p>
          <p><b>Nhiệm vụ:</b> ${round.frame.duties[round.slot]}</p>
          <p style="color:var(--muted);font-size:13px">Vòng tròn vàng nét đứt là vị trí đúng.</p>
          <div style="display:flex;gap:8px;margin-top:12px">
            <button class="btn" data-quiz="next">Câu tiếp ▶</button>
            <button class="btn secondary" data-quiz="reset">Làm lại từ 0</button>
          </div>
        </div>` : `<div class="joke">${round.frame.joke}</div>`}
    `;
    info.querySelector('[data-quiz="next"]')?.addEventListener('click', next);
    info.querySelector('[data-quiz="reset"]')?.addEventListener('click', () => { total = 0; played = 0; next(); });
  }

  function stop() {
    abort?.abort();
    abort = null;
    if (round) pitch.tokens[round.slot].classList.remove('pick');
    round = null;
    pitch.clearGhost();
    bar.hidden = true;
  }

  return { start: next, stop };
}
