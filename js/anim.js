// Dựng chuỗi chuyển động cho sa bàn động (thuần, không DOM).

// Mỗi mũi tên của frame → một bước. Bước sau thấy vị trí đã cập nhật của bước trước.
export function buildTimeline(frame) {
  const pos = Object.fromEntries(Object.entries(frame.us).map(([s, p]) => [s, [...p]]));
  let ball = [...frame.ball];
  return frame.arrows.map(({ from: slot, to, kind }) => {
    const step = { slot, kind, from: kind === 'pass' ? [...ball] : [...pos[slot]], to: [...to] };
    if (kind === 'run') pos[slot] = [...to];
    else ball = [...to];
    return { ...step, ball: [...ball] };
  });
}

// Đối thủ xê dịch về phía bóng: factor × khoảng cách, không quá `max` đơn vị.
export function driftOpponents(them, ball, factor, max) {
  return them.map(([x, y]) => {
    const dx = (ball[0] - x) * factor;
    const dy = (ball[1] - y) * factor;
    const len = Math.hypot(dx, dy);
    const k = len > max ? max / len : 1;
    const r = v => Math.round(v * 100) / 100;
    return [r(x + dx * k), r(y + dy * k)];
  });
}

// Trạng thái cuối sau khi chạy hết chuỗi (dùng khi người xem tắt hiệu ứng chuyển động).
export function finalScene(frame, { factor = 0.25, max = 4 } = {}) {
  const us = Object.fromEntries(Object.entries(frame.us).map(([s, p]) => [s, [...p]]));
  let them = frame.them.map(p => [...p]);
  let ball = [...frame.ball];
  for (const step of buildTimeline(frame)) {
    if (step.kind === 'run') us[step.slot] = step.to;
    else { ball = step.to; them = driftOpponents(them, ball, factor, max); }
  }
  return { us, them, ball };
}
