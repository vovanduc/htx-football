import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PLAYERS, DEFAULT_LINEUP, SLOTS } from '../js/data/roster.js';
import { sanitizeLineup, swapPlayers, benchOf } from '../js/engine.js';

test('sanitizeLineup giữ lineup hợp lệ', () => {
  const saved = { ...DEFAULT_LINEUP, ST: 'minhhung' };
  assert.deepEqual(sanitizeLineup(saved, PLAYERS, DEFAULT_LINEUP), saved);
});

test('sanitizeLineup về mặc định khi id lạ, thiếu slot, trùng người hoặc rác', () => {
  assert.deepEqual(sanitizeLineup({ ...DEFAULT_LINEUP, GK: 'ghost' }, PLAYERS, DEFAULT_LINEUP), DEFAULT_LINEUP);
  assert.deepEqual(sanitizeLineup({ GK: 'diep' }, PLAYERS, DEFAULT_LINEUP), DEFAULT_LINEUP);
  assert.deepEqual(sanitizeLineup({ ...DEFAULT_LINEUP, ST: 'duc' }, PLAYERS, DEFAULT_LINEUP), DEFAULT_LINEUP);
  assert.deepEqual(sanitizeLineup(null, PLAYERS, DEFAULT_LINEUP), DEFAULT_LINEUP);
  assert.deepEqual(sanitizeLineup('xx', PLAYERS, DEFAULT_LINEUP), DEFAULT_LINEUP);
});

test('swapPlayers: dự bị vào thay người trên sân', () => {
  const out = swapPlayers(DEFAULT_LINEUP, 'minhhung', 'cuong', PLAYERS);
  assert.equal(out.ST, 'minhhung');
  assert.equal(DEFAULT_LINEUP.ST, 'cuong', 'không mutate input');
  assert.deepEqual(benchOf(out, PLAYERS).map(p => p.id), ['cuong']);
});

test('swapPlayers: hai người trên sân đổi chỗ', () => {
  const out = swapPlayers(DEFAULT_LINEUP, 'duc', 'cuong', PLAYERS);
  assert.equal(out.ST, 'duc');
  assert.equal(out.CM, 'cuong');
});

test('swapPlayers: cùng người, hai dự bị hoặc id lạ → không đổi', () => {
  assert.deepEqual(swapPlayers(DEFAULT_LINEUP, 'duc', 'duc', PLAYERS), DEFAULT_LINEUP);
  assert.deepEqual(swapPlayers(DEFAULT_LINEUP, 'ghost', 'duc', PLAYERS), DEFAULT_LINEUP);
  assert.deepEqual(swapPlayers(DEFAULT_LINEUP, 'minhhung', 'ghost', PLAYERS), DEFAULT_LINEUP);
});

test('benchOf trả người không có slot', () => {
  assert.deepEqual(benchOf(DEFAULT_LINEUP, PLAYERS).map(p => p.id), ['minhhung']);
  assert.equal(SLOTS.length, 8);
});
