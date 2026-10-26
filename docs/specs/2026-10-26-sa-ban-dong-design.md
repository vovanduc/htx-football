# Sa bàn động — Design (feat-004)

Ngày: 2026-10-26 · Yêu cầu từ user (Đức): bỏ bảng "Nhiệm vụ từng người", sa bàn rộng hơn, bấm chiến thuật/tình huống → hiệu ứng loading → cầu thủ di chuyển thật thay cho mũi tên, ai xem cũng biết mình làm gì mà không cần bấm nhiều.

## Hành vi
1. Chọn chiến thuật/pha/tình huống → màn che trên sân (~900ms): bóng xoay + tên + pha + "Tuýt!". Cùng lúc cầu thủ/đối thủ/bóng trượt về vị trí xuất phát của frame.
2. Phát lần lượt từng `arrow` của frame (theo thứ tự trong data): `run` → cầu thủ chạy tới `to` (nhún khi chạy); `pass` → bóng lăn từ vị trí hiện tại tới `to`. Mỗi bước ~1.1s.
3. Trong mỗi bước: dải chú thích ở đáy sân hiện avatar + "Tên #số: nhiệm vụ" của người thực hiện.
4. Đối thủ dịch nhẹ về phía bóng sau mỗi đường chuyền (25% khoảng cách, tối đa 4 đơn vị).
5. Hết chuỗi: chú thích hiện câu joke + nút "↻ Xem lại". Bấm lựa chọn khác giữa chừng → hủy chuỗi cũ ngay.
6. `prefers-reduced-motion`: bỏ màn che + nhảy thẳng tới trạng thái cuối.
7. Bỏ khung "Nhiệm vụ từng người" + legend mũi tên. Chạm cầu thủ vẫn mở thẻ nhiệm vụ.
8. Sân rộng hơn: mobile gần sát mép (gutter 6px); desktop cao theo viewport, panel thông tin hẹp bên phải.

## Kỹ thuật
- `js/anim.js` thuần: `buildTimeline(frame)`, `driftOpponents(them, ball, factor, max)` — test node.
- `js/pitch.js`: bỏ SVG mũi tên; thêm API di chuyển từng token/bóng/đối thủ với thời lượng, màn che, chú thích, nút xem lại.
- `js/app.js`: bộ điều khiển phát async có hủy (run id).
