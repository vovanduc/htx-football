import { TEAM, PLAYERS, SLOTS, SLOT_LABELS, SLOT_TAGLINES, DEFAULT_LINEUP } from './data/roster.js';
import { TACTICS, SCENARIOS } from './data/tactics.js';
import { GOLDEN_RULES } from './data/rules.js';
import { createPitch } from './pitch.js';
import { buildTimeline, driftOpponents, finalScene, pickCorner, quietSide } from './anim.js';

const $ = sel => document.querySelector(sel);
const playersById = Object.fromEntries(PLAYERS.map(p => [p.id, p]));
const PHASE_LABEL = { attack: 'Tấn công', defend: 'Phòng thủ' };
const PHASE_ICON = { attack: '⚔️', defend: '🛡️' };
const STEP_MS = 1000; // thời gian một pha di chuyển
const HOLD_MS = 900; // dừng để kịp đọc chú thích
const ARROW_MS = 550; // mũi tên vẽ xong rồi người/bóng mới chạy
const sleep = ms => new Promise(r => setTimeout(r, ms));
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const state = {
  tab: 'tactic',
  tacticId: TACTICS[0].id,
  phase: 'attack',
  scenarioId: SCENARIOS[0].id,
  lineup: DEFAULT_LINEUP,
};

const pitch = createPitch($('#pitch'), { onTokenTap, onReplay: () => play() });

// ---------- URL hash: chia sẻ link thẳng tới chiến thuật/pha trong Zalo ----------
function readHash() {
  const h = new URLSearchParams(location.hash.slice(1));
  const tab = h.get('tab');
  if (['tactic', 'scenario', 'team'].includes(tab)) state.tab = tab;
  if (TACTICS.some(t => t.id === h.get('t'))) state.tacticId = h.get('t');
  if (['attack', 'defend'].includes(h.get('p'))) state.phase = h.get('p');
  if (SCENARIOS.some(s => s.id === h.get('s'))) state.scenarioId = h.get('s');
}

function writeHash() {
  const h = new URLSearchParams({ tab: state.tab });
  if (state.tab === 'tactic') { h.set('t', state.tacticId); h.set('p', state.phase); }
  if (state.tab === 'scenario') h.set('s', state.scenarioId);
  history.replaceState(null, '', `#${h}`);
}

// ---------- Frame hiện tại ----------
function current() {
  if (state.tab === 'scenario') {
    const s = SCENARIOS.find(x => x.id === state.scenarioId);
    return { frame: s.frame, title: s.name, phase: s.phase, item: s };
  }
  const t = TACTICS.find(x => x.id === state.tacticId);
  return { frame: t.phases[state.phase], title: t.name, phase: state.phase, item: t };
}

function frameKey() {
  return state.tab === 'scenario' ? state.scenarioId : `${state.tacticId}:${state.phase}`;
}

function dressPitch() {
  pitch.dress({ lineup: state.lineup, playersById, captainId: TEAM.captainId });
}

// ---------- Hoạt cảnh: màn che → từng người di chuyển theo chiến thuật ----------
let runId = 0; // tăng mỗi lần phát mới → chuỗi cũ tự dừng
let sceneKey = null; // frame đang hiển thị; chỉ phát lại khi đổi frame

function captionFor(slot, frame) {
  const p = playersById[state.lineup[slot]];
  return `<img src="${p.avatar}" alt=""><div><b>${p.name}${p.number ? ' #' + p.number : ''}</b> ${frame.duties[slot]}</div>`;
}

// Hành động ở nửa dưới sân → chú thích lên trên, và ngược lại.
const captionSide = (y1, y2) => (Math.max(y1, y2) > 55 ? 'top' : 'bottom');

async function play() {
  const id = ++runId;
  const alive = () => id === runId;
  const { frame, title, phase } = current();
  pitch.showReplay(false);
  pitch.clearArrows();
  pitch.highlight(null);
  pitch.setCaption('');
  const end = finalScene(frame);
  const done = () => {
    pitch.highlight(null);
    const pts = [...Object.values(end.us), ...end.them, end.ball];
    const side = quietSide(pts);
    pitch.setCaption(`<span class="cap-joke">😆 ${frame.joke}</span>`, side);
    pitch.showReplay(pickCorner(pts, side));
  };

  if (reduceMotion.matches) {
    pitch.hideCurtain();
    pitch.setScene(frame, 0);
    for (const step of buildTimeline(frame)) pitch.showArrow(step.from, step.to, step.kind);
    pitch.setScene(end, 0);
    done();
    return;
  }

  pitch.showCurtain(title, `${PHASE_ICON[phase]} ${PHASE_LABEL[phase]}`);
  pitch.setScene(frame, 700);
  await sleep(1100);
  if (!alive()) return;
  pitch.hideCurtain();

  let them = frame.them;
  for (const step of buildTimeline(frame)) {
    pitch.highlight(step.slot);
    pitch.setCaption(captionFor(step.slot, frame), captionSide(step.from[1], step.to[1]));
    pitch.showArrow(step.from, step.to, step.kind);
    await sleep(ARROW_MS);
    if (!alive()) return;
    if (step.kind === 'run') {
      pitch.moveToken(step.slot, step.to, STEP_MS);
    } else {
      pitch.moveBall(step.to, STEP_MS * 0.8);
      them = driftOpponents(them, step.to, 0.25, 4);
      pitch.moveOpps(them, STEP_MS);
    }
    await sleep(STEP_MS + HOLD_MS);
    if (!alive()) return;
  }
  done();
}

function stopPlayback() {
  runId += 1;
  sceneKey = null;
}

// ---------- Render ----------
function render() {
  document.querySelectorAll('.tabs button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === state.tab)));
  const isTeam = state.tab === 'team';
  $('#board-view').hidden = isTeam;
  $('#team-view').hidden = !isTeam;
  writeHash();

  if (isTeam) { stopPlayback(); renderTeam(); return; }
  renderPickers();
  dressPitch();
  renderInfo();
  if (frameKey() !== sceneKey) {
    sceneKey = frameKey();
    play();
  }
}

function renderPickers() {
  const el = $('#pickers');
  if (state.tab === 'tactic') {
    el.innerHTML = `
      <div class="chips" role="group" aria-label="Chọn chiến thuật">
        ${TACTICS.map(t => `<button class="chip" data-tactic="${t.id}" aria-pressed="${t.id === state.tacticId}">${t.name}</button>`).join('')}
      </div>
      <div class="segment" role="group" aria-label="Pha">
        <button class="atk" data-phase="attack" aria-pressed="${state.phase === 'attack'}">⚔️ Mình tấn công</button>
        <button class="def" data-phase="defend" aria-pressed="${state.phase === 'defend'}">🛡️ Mình phòng thủ</button>
      </div>`;
  } else {
    el.innerHTML = `
      <div class="chips" role="group" aria-label="Chọn tình huống">
        ${SCENARIOS.map(s => `<button class="chip" data-scenario="${s.id}" aria-pressed="${s.id === state.scenarioId}">${s.phase === 'attack' ? '⚔️' : '🛡️'} ${s.name}</button>`).join('')}
      </div>`;
  }
  el.querySelector('[aria-pressed="true"].chip')?.scrollIntoView({ block: 'nearest', inline: 'center' });
}

function renderInfo() {
  const { title, phase, item } = current();
  const isTactic = state.tab === 'tactic';
  $('#info').innerHTML = `
    <div class="card">
      <div class="meta">
        <span>${PHASE_ICON[phase]} ${PHASE_LABEL[phase]}</span>
        ${isTactic ? `<span title="Độ mệt">Độ mệt ${'🥵'.repeat(item.tiredness)}</span>` : ''}
      </div>
      <h2>${title}</h2>
      ${isTactic ? `<div class="nick">“${item.nickname}”</div><p>${item.summary}</p><p><b>Khi nào dùng:</b> ${item.when}</p>` : ''}
      <p class="muted-hint">👆 Chạm vào cầu thủ trên sân để xem kỹ nhiệm vụ · ↻ Xem lại để chạy lại</p>
    </div>
  `;
}

function renderTeam() {
  const slotOf = id => SLOTS.find(s => state.lineup[s] === id);
  $('#team-view').innerHTML = `
    <div class="card formation">
      <h2>Đội hình dự kiến</h2>
      <img src="assets/team/formation-ref.jpg" alt="Đội hình dự kiến 3-2-2" style="width:100%;border-radius:10px">
    </div>

    <div class="team-grid team-section">
      ${PLAYERS.filter(p => slotOf(p.id)).map(p => `
        <div class="player-card ${p.id === TEAM.captainId ? 'captain' : ''}">
          <img src="${p.avatar}" alt="${p.name}" loading="lazy">
          <div class="n">${p.name} ${p.number ? '#' + p.number : ''} ${p.id === TEAM.captainId ? '©' : ''}</div>
          <div class="r">${SLOT_LABELS[slotOf(p.id)]}${p.id === TEAM.captainId ? ' · Đội trưởng' : ''}</div>
        </div>`).join('')}
    </div>

    <div class="team-section card">
      <h2>Áo đấu</h2>
      <div class="kit">
        <img src="assets/team/jersey.jpg" alt="Mẫu áo đội màu xanh ngọc" loading="lazy">
        <p>Áo xanh ngọc, quần xanh ngọc. Mặc đủ bộ thì đá hay hơn 10% (chưa kiểm chứng khoa học).</p>
      </div>
    </div>

    <div class="team-section card">
      <h2>Luật vàng sân 7</h2>
      <ol class="rules">${GOLDEN_RULES.map(r => `<li>${r}</li>`).join('')}</ol>
    </div>

  `;
}

// ---------- Bottom sheet chi tiết cầu thủ ----------
function openSheet(slot) {
  const p = playersById[state.lineup[slot]];
  const { frame, title, phase } = current();
  const card = $('#sheet .sheet-card');
  card.innerHTML = `
    <div class="head">
      <img src="${p.avatar}" alt="">
      <div>
        <h3 id="sheet-title">${p.name} ${p.number ? '#' + p.number : ''} ${p.id === TEAM.captainId ? '©' : ''}</h3>
        <div class="tag">${SLOT_LABELS[slot]} · ${SLOT_TAGLINES[slot]}</div>
      </div>
    </div>
    <div class="task"><b>${title} · ${PHASE_LABEL[phase]}</b>${frame.duties[slot]}</div>
    <div class="actions">
      <button class="btn secondary" data-close>Đóng</button>
    </div>
  `;
  $('#sheet').hidden = false;
  card.querySelector('[data-close]').focus();
}

function closeSheet() { $('#sheet').hidden = true; }

function onTokenTap(slot) {
  openSheet(slot);
}

// ---------- Sự kiện ----------
document.addEventListener('click', e => {
  const t = e.target.closest('button');
  if (!t) return;
  if (t.dataset.tab) { state.tab = t.dataset.tab; render(); window.scrollTo({ top: 0 }); }
  else if (t.dataset.tactic) { state.tacticId = t.dataset.tactic; render(); }
  else if (t.dataset.phase) { state.phase = t.dataset.phase; render(); }
  else if (t.dataset.scenario) { state.scenarioId = t.dataset.scenario; render(); }
  else if ('close' in t.dataset) closeSheet();
});

$('#sheet').addEventListener('click', e => { if (e.target.id === 'sheet') closeSheet(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

window.addEventListener('hashchange', () => { readHash(); render(); });

readHash();
render();
