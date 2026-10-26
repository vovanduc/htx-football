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

// Chọn góc sân trống nhất cho nút "Xem lại" (xa người và bóng nhất), bỏ qua góc phía chú thích.
const CORNERS = { tl: [8, 5], tr: [92, 5], bl: [8, 95], br: [92, 95] };
export function pickCorner(points, captionSide) {
  let best = null;
  for (const [name, [cx, cy]] of Object.entries(CORNERS)) {
    if (name[0] === captionSide[0]) continue; // 't'op / 'b'ottom
    const d = Math.min(...points.map(([x, y]) => Math.hypot(x - cx, y - cy)));
    if (!best || d > best.d) best = { name, d };
  }
  return best.name;
}

// Đặt chú thích ở dải trên hay dưới: phía có ít người hơn trong 20% mép sân.
export function quietSide(points) {
  const top = points.filter(([, y]) => y < 20).length;
  const bottom = points.filter(([, y]) => y > 80).length;
  return top < bottom ? 'top' : 'bottom';
}
