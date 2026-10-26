import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PLAYERS, DEFAULT_LINEUP, SLOTS } from '../js/data/roster.js';
import { sanitizeLineup, swapPlayers, benchOf, distance, scoreDrop, clampPoint } from '../js/engine.js';

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
  const out = swapPlayers(DEFAULT_LINEUP, 'minhhung', 'cuong');
  assert.equal(out.ST, 'minhhung');
  assert.equal(DEFAULT_LINEUP.ST, 'cuong', 'không mutate input');
  assert.deepEqual(benchOf(out, PLAYERS).map(p => p.id), ['cuong']);
});

test('swapPlayers: hai người trên sân đổi chỗ', () => {
  const out = swapPlayers(DEFAULT_LINEUP, 'duc', 'cuong');
  assert.equal(out.ST, 'duc');
  assert.equal(out.CM, 'cuong');
});

test('swapPlayers: cùng người, hai dự bị hoặc id lạ → không đổi', () => {
  assert.deepEqual(swapPlayers(DEFAULT_LINEUP, 'duc', 'duc'), DEFAULT_LINEUP);
  assert.deepEqual(swapPlayers(DEFAULT_LINEUP, 'ghost', 'duc'), DEFAULT_LINEUP);
  assert.deepEqual(swapPlayers(DEFAULT_LINEUP, 'minhhung', 'ghost'), DEFAULT_LINEUP);
});

test('benchOf trả người không có slot', () => {
  assert.deepEqual(benchOf(DEFAULT_LINEUP, PLAYERS).map(p => p.id), ['minhhung']);
  assert.equal(SLOTS.length, 8);
});

test('distance + scoreDrop theo ngưỡng', () => {
  assert.equal(distance([0, 0], [3, 4]), 5);
  assert.deepEqual(scoreDrop(6), { points: 100, verdict: 'Chuẩn như Pep' });
  assert.deepEqual(scoreDrop(12), { points: 70, verdict: 'Tạm được, lệch xíu' });
  assert.deepEqual(scoreDrop(20), { points: 40, verdict: 'Hơi lạc trôi' });
  assert.deepEqual(scoreDrop(20.1), { points: 0, verdict: 'Đi lạc sang sân bên cạnh' });
});

test('clampPoint kẹp trong 0–100', () => {
  assert.deepEqual(clampPoint([-5, 120]), [0, 100]);
  assert.deepEqual(clampPoint([42, 7]), [42, 7]);
});
