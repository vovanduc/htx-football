import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { PLAYERS, SLOTS, DEFAULT_LINEUP, TEAM } from '../js/data/roster.js';
import { TACTICS, SCENARIOS, allFrames } from '../js/data/tactics.js';
import { GOLDEN_RULES } from '../js/data/rules.js';

const inPitch = ([x, y]) => x >= 0 && x <= 100 && y >= 0 && y <= 100;

test('roster: số áo không trùng, avatar tồn tại, đội trưởng có thật', () => {
  const numbers = PLAYERS.map(p => p.number).filter(n => n !== null);
  assert.equal(new Set(numbers).size, numbers.length);
  for (const p of PLAYERS) assert.ok(existsSync(new URL(`../${p.avatar}`, import.meta.url)), p.avatar);
  assert.ok(PLAYERS.some(p => p.id === TEAM.captainId));
  assert.deepEqual(Object.keys(DEFAULT_LINEUP).sort(), [...SLOTS].sort());
});

test('đủ 6 chiến thuật + 3 tình huống, id duy nhất', () => {
  assert.equal(TACTICS.length, 6);
  assert.equal(SCENARIOS.length, 3);
  const ids = [...TACTICS, ...SCENARIOS].map(t => t.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const t of TACTICS) {
    assert.ok(t.phases.attack && t.phases.defend, t.id);
    assert.ok(t.tiredness >= 1 && t.tiredness <= 5, t.id);
    assert.ok(t.name && t.nickname && t.when && t.summary, t.id);
  }
  for (const s of SCENARIOS) assert.ok(['attack', 'defend'].includes(s.phase), s.id);
});

test('mỗi frame: đủ 8 slot, 8 đối thủ, tọa độ trong sân, nhiệm vụ đủ, có joke', () => {
  for (const { key, frame } of allFrames()) {
    assert.deepEqual(Object.keys(frame.us).sort(), [...SLOTS].sort(), key);
    assert.deepEqual(Object.keys(frame.duties).sort(), [...SLOTS].sort(), key);
    assert.equal(frame.them.length, 8, key);
    assert.ok(inPitch(frame.ball), key);
    for (const pt of [...Object.values(frame.us), ...frame.them]) assert.ok(inPitch(pt), `${key} ${pt}`);
    for (const a of frame.arrows) {
      assert.ok(SLOTS.includes(a.from), `${key} arrow ${a.from}`);
      assert.ok(['run', 'pass'].includes(a.kind), key);
      assert.ok(inPitch(a.to), key);
    }
    assert.ok(frame.joke, key);
  }
});

test('bóng đá có lý: thủ môn luôn là người lùi sâu nhất của mình', () => {
  for (const { key, frame } of allFrames()) {
    const gkY = frame.us.GK[1];
    for (const s of SLOTS.filter(s => s !== 'GK')) assert.ok(frame.us[s][1] < gkY, `${key} ${s}`);
    assert.ok(gkY >= 78, key);
  }
});

test('luật vàng đủ 5 điều trở lên', () => {
  assert.ok(GOLDEN_RULES.length >= 5);
});
