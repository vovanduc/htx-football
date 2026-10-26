import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildTimeline, driftOpponents, finalScene } from '../js/anim.js';
import { TACTICS, allFrames } from '../js/data/tactics.js';

test('buildTimeline: một bước cho mỗi mũi tên, đúng thứ tự', () => {
  const frame = TACTICS.find(t => t.id === 'danh-bien-chong-bien').phases.attack;
  const steps = buildTimeline(frame);
  assert.equal(steps.length, frame.arrows.length);
  assert.deepEqual(steps.map(s => [s.slot, s.kind]), frame.arrows.map(a => [a.from, a.kind]));
});

test('buildTimeline: run cập nhật vị trí cầu thủ, pass cập nhật vị trí bóng', () => {
  const frame = {
    ball: [50, 50],
    us: { CM: [50, 50], ST: [50, 20] },
    them: [],
    arrows: [
      { from: 'ST', to: [40, 10], kind: 'run' },
      { from: 'CM', to: [41, 11], kind: 'pass' },
      { from: 'ST', to: [45, 5], kind: 'run' },
    ],
  };
  const steps = buildTimeline(frame);
  assert.deepEqual(steps[0], { slot: 'ST', kind: 'run', from: [50, 20], to: [40, 10], ball: [50, 50] });
  assert.deepEqual(steps[1], { slot: 'CM', kind: 'pass', from: [50, 50], to: [41, 11], ball: [41, 11] });
  assert.deepEqual(steps[2].from, [40, 10], 'run thứ 2 bắt đầu từ chỗ run thứ 1 kết thúc');
  assert.deepEqual(steps[2].ball, [41, 11]);
});

test('buildTimeline không mutate frame', () => {
  for (const { frame } of allFrames()) {
    const before = JSON.stringify(frame);
    buildTimeline(frame);
    assert.equal(JSON.stringify(frame), before);
  }
});

test('driftOpponents: dịch về phía bóng theo tỉ lệ, có giới hạn', () => {
  assert.deepEqual(driftOpponents([[50, 50]], [58, 50], 0.25, 4), [[52, 50]]);
  assert.deepEqual(driftOpponents([[0, 0]], [100, 0], 0.25, 4), [[4, 0]]);
  assert.deepEqual(driftOpponents([[10, 10]], [10, 10], 0.25, 4), [[10, 10]]);
});

test('finalScene: runner tới đích, bóng ở điểm chuyền cuối, đối thủ dịch theo bóng', () => {
  const frame = {
    ball: [50, 50],
    us: { CM: [50, 50], ST: [50, 20] },
    them: [[50, 30]],
    arrows: [
      { from: 'ST', to: [40, 10], kind: 'run' },
      { from: 'CM', to: [40, 10], kind: 'pass' },
    ],
  };
  const end = finalScene(frame);
  assert.deepEqual(end.us, { CM: [50, 50], ST: [40, 10] });
  assert.deepEqual(end.ball, [40, 10]);
  assert.deepEqual(end.them, driftOpponents([[50, 30]], [40, 10], 0.25, 4));
  assert.deepEqual(frame.us.ST, [50, 20], 'không mutate');
});
