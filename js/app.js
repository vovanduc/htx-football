import { TEAM, PLAYERS, SLOTS, SLOT_LABELS, SLOT_TAGLINES, DEFAULT_LINEUP } from './data/roster.js';
import { TACTICS, SCENARIOS } from './data/tactics.js';
import { LESSONS, GOLDEN_RULES } from './data/lessons.js';
import { sanitizeLineup, swapPlayers, benchOf } from './engine.js';
import { createPitch } from './pitch.js';
import { createQuiz } from './quiz.js';

const $ = sel => document.querySelector(sel);
const playersById = Object.fromEntries(PLAYERS.map(p => [p.id, p]));
const PHASE_LABEL = { attack: 'Tấn công', defend: 'Phòng thủ' };

// localStorage có thể bị chặn (private mode) → mọi truy cập đều bọc try/catch.
const store = {
  get(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* bỏ qua */ }
  },
};

const state = {
  tab: 'tactic',
  tacticId: TACTICS[0].id,
  phase: 'attack',
  scenarioId: SCENARIOS[0].id,
  me: playersById[store.get('htx.me')] ? store.get('htx.me') : null,
  lineup: sanitizeLineup(store.get('htx.lineup'), PLAYERS, DEFAULT_LINEUP),
  subPick: null, // id cầu thủ dự bị đang chờ vào sân
};

const pitch = createPitch($('#pitch'), { onTokenTap });
const quiz = createQuiz({
  pitch,
  bar: $('#quiz-bar'),
  info: $('#info'),
  getCtx: () => ({ lineup: state.lineup, me: state.me, playersById }),
  renderFrame: (frame, opts) => renderPitch(frame, opts),
});

// ---------- URL hash: chia sẻ link thẳng tới chiến thuật/pha trong Zalo ----------
function readHash() {
  const h = new URLSearchParams(location.hash.slice(1));
  const tab = h.get('tab');
  if (['tactic', 'scenario', 'quiz', 'team'].includes(tab)) state.tab = tab;
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

function renderPitch(frame, opts = {}) {
  pitch.render(frame, {
    lineup: state.lineup,
    playersById,
    me: state.me,
    captainId: TEAM.captainId,
    pickMode: Boolean(state.subPick),
    ...opts,
  });
}

// ---------- Render ----------
function render() {
  document.querySelectorAll('.tabs button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === state.tab)));
  const isTeam = state.tab === 'team';
  $('#board-view').hidden = isTeam;
  $('#team-view').hidden = !isTeam;
  writeHash();

  if (isTeam) { quiz.stop(); renderTeam(); return; }
  if (state.tab === 'quiz') {
    $('#pickers').innerHTML = '';
    $('#bench').innerHTML = '';
    quiz.start();
    return;
  }
  quiz.stop();
  renderPickers();
  const { frame } = current();
  renderPitch(frame);
  renderBench();
  renderInfo();
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

function renderBench() {
  const bench = benchOf(state.lineup, PLAYERS);
  const changed = SLOTS.some(s => state.lineup[s] !== DEFAULT_LINEUP[s]);
  $('#bench').innerHTML = `
    <span class="label">Dự bị:</span>
    ${bench.map(p => `
      <button class="sub-chip" data-sub="${p.id}" aria-pressed="${state.subPick === p.id}">
        <img src="${p.avatar}" alt="">${p.name}${p.number ? ' #' + p.number : ''}
      </button>`).join('') || '<span class="label">không có ai</span>'}
    ${changed ? '<button class="ghost-btn" data-reset-lineup>↺ Đội hình chuẩn</button>' : ''}
    ${state.subPick ? `<span class="hint">Chạm vào người trên sân để ${playersById[state.subPick].name} vào thay.</span>` : ''}
  `;
}

function renderInfo() {
  const { frame, title, phase, item } = current();
  const isTactic = state.tab === 'tactic';
  $('#info').innerHTML = `
    <div class="card">
      <div class="meta">
        <span>${phase === 'attack' ? '⚔️' : '🛡️'} ${PHASE_LABEL[phase]}</span>
        ${isTactic ? `<span title="Độ mệt">Độ mệt ${'🥵'.repeat(item.tiredness)}</span>` : ''}
      </div>
      <h2>${title}</h2>
      ${isTactic ? `<div class="nick">“${item.nickname}”</div><p>${item.summary}</p><p><b>Khi nào dùng:</b> ${item.when}</p>` : ''}
    </div>
    <div class="joke">${frame.joke}</div>
    <div class="card">
      <h2 style="font-size:16px;margin-bottom:10px">Nhiệm vụ từng người</h2>
      <ul class="duties">
        ${SLOTS.map(s => {
          const p = playersById[state.lineup[s]];
          return `<li class="${p.id === state.me ? 'me' : ''}">
            <img src="${p.avatar}" alt="">
            <div><div class="who"><b>${p.name}${p.number ? ' #' + p.number : ''}</b> · ${SLOT_LABELS[s]}</div>
            <div class="what">${frame.duties[s]}</div></div>
          </li>`;
        }).join('')}
      </ul>
    </div>
    <div class="legend">
      <span><i></i>Chạy chỗ</span><span><i class="pass"></i>Chuyền bóng</span><span><i class="opp"></i>Đội bạn</span><span>Chạm vào cầu thủ để xem nhiệm vụ</span>
    </div>
  `;
}

function renderTeam() {
  const slotOf = id => SLOTS.find(s => state.lineup[s] === id);
  $('#team-view').innerHTML = `
    <div class="team-grid">
      ${PLAYERS.map(p => `
        <div class="player-card ${p.id === TEAM.captainId ? 'captain' : ''}">
          <img src="${p.avatar}" alt="${p.name}" loading="lazy">
          <div class="n">${p.name} ${p.number ? '#' + p.number : ''} ${p.id === TEAM.captainId ? '©' : ''}</div>
          <div class="r">${slotOf(p.id) ? SLOT_LABELS[slotOf(p.id)] : 'Dự bị'}${p.id === TEAM.captainId ? ' · Đội trưởng' : ''}</div>
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

    <div class="team-section card">
      <h2>Bài học sau trận</h2>
      ${LESSONS.length ? LESSONS.map(l => `
        <div class="lesson">
          <div class="d">${l.date} · vs ${l.opponent} · ${l.result}</div>
          <ul>${l.notes.map(n => `<li>${n}</li>`).join('')}</ul>
        </div>`).join('<hr style="border-color:var(--line)">')
      : '<p class="empty">Chưa có bài học nào. Đá xong trận đầu, cả đội rút kinh nghiệm rồi ghi vào đây nhé.</p>'}
    </div>

    <div class="team-section card">
      <h2>Sơ đồ gốc của anh Cường</h2>
      <img src="assets/team/formation-ref.jpg" alt="Sơ đồ đội hình 8 người 3-2-2" style="width:100%;border-radius:10px" loading="lazy">
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
      ${p.id === state.me ? '' : `<button class="btn" data-set-me="${p.id}">Đây là tôi</button>`}
    </div>
  `;
  $('#sheet').hidden = false;
  card.querySelector('[data-close]').focus();
}

function closeSheet() { $('#sheet').hidden = true; }

function onTokenTap(slot) {
  if (state.tab === 'quiz') return;
  if (state.subPick) {
    state.lineup = swapPlayers(state.lineup, state.subPick, state.lineup[slot], PLAYERS);
    state.subPick = null;
    store.set('htx.lineup', state.lineup);
    render();
    return;
  }
  openSheet(slot);
}

function setMe(id) {
  state.me = playersById[id] ? id : null;
  store.set('htx.me', state.me);
  $('#me-select').value = state.me ?? '';
}

// ---------- Sự kiện ----------
document.addEventListener('click', e => {
  const t = e.target.closest('button');
  if (!t) return;
  if (t.dataset.tab) { state.tab = t.dataset.tab; state.subPick = null; render(); window.scrollTo({ top: 0 }); }
  else if (t.dataset.tactic) { state.tacticId = t.dataset.tactic; render(); }
  else if (t.dataset.phase) { state.phase = t.dataset.phase; render(); }
  else if (t.dataset.scenario) { state.scenarioId = t.dataset.scenario; render(); }
  else if (t.dataset.sub) { state.subPick = state.subPick === t.dataset.sub ? null : t.dataset.sub; render(); }
  else if ('resetLineup' in t.dataset) { state.lineup = { ...DEFAULT_LINEUP }; store.set('htx.lineup', state.lineup); render(); }
  else if (t.dataset.setMe) { setMe(t.dataset.setMe); closeSheet(); render(); }
  else if ('close' in t.dataset) closeSheet();
});

$('#sheet').addEventListener('click', e => { if (e.target.id === 'sheet') closeSheet(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

const meSelect = $('#me-select');
meSelect.innerHTML = '<option value="">— chọn —</option>' +
  PLAYERS.map(p => `<option value="${p.id}">${p.name}${p.number ? ' #' + p.number : ''}</option>`).join('');
meSelect.value = state.me ?? '';
meSelect.addEventListener('change', () => { setMe(meSelect.value); render(); });

window.addEventListener('hashchange', () => { readHash(); render(); });

readHash();
render();
