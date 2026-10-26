// Logic thuần (không DOM) — test bằng `npm test`.
import { SLOTS } from './data/roster.js';

// Lineup lưu trong localStorage có thể cũ/hỏng: chỉ nhận khi đủ 8 slot, id tồn tại, không trùng.
export function sanitizeLineup(saved, players, fallback) {
  if (!saved || typeof saved !== 'object') return { ...fallback };
  const ids = new Set(players.map(p => p.id));
  const used = new Set();
  for (const slot of SLOTS) {
    const id = saved[slot];
    if (!ids.has(id) || used.has(id)) return { ...fallback };
    used.add(id);
  }
  return Object.fromEntries(SLOTS.map(s => [s, saved[s]]));
}

function slotOf(lineup, id) {
  return SLOTS.find(s => lineup[s] === id);
}

// a hoặc b có thể là dự bị; cần ít nhất một người trên sân, cả hai phải có trong danh sách.
export function swapPlayers(lineup, aId, bId, players) {
  const out = { ...lineup };
  const ids = new Set(players.map(p => p.id));
  if (aId === bId || !ids.has(aId) || !ids.has(bId)) return out;
  const sa = slotOf(lineup, aId);
  const sb = slotOf(lineup, bId);
  if (!sa && !sb) return out;
  if (sa) out[sa] = bId;
  if (sb) out[sb] = aId;
  return out;
}

export function benchOf(lineup, players) {
  const onPitch = new Set(SLOTS.map(s => lineup[s]));
  return players.filter(p => !onPitch.has(p.id));
}

export function distance([ax, ay], [bx, by]) {
  return Math.hypot(ax - bx, ay - by);
}

export function scoreDrop(dist) {
  if (dist <= 6) return { points: 100, verdict: 'Chuẩn như Pep' };
  if (dist <= 12) return { points: 70, verdict: 'Tạm được, lệch xíu' };
  if (dist <= 20) return { points: 40, verdict: 'Hơi lạc trôi' };
  return { points: 0, verdict: 'Đi lạc sang sân bên cạnh' };
}

export function clampPoint([x, y]) {
  const c = v => Math.min(100, Math.max(0, v));
  return [c(x), c(y)];
}
