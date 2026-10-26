# Session Progress Log

## Current State
**Last Updated:** 2026-10-27
**Active Feature:** — (không có feature in-progress)
**Live:** https://vovanduc.github.io/htx-football/ · repo https://github.com/vovanduc/htx-football (public)

## Current Verified State
- `./init.sh` pass (npm test 12/12). Local: `npm run serve` → http://127.0.0.1:8077
- feat-001…005 done (evidence trong feature_list.json). Pages build tự động mỗi lần push `main`.

## Decisions
- Sân 7 miền Nam = 7 cầu thủ + thủ môn (8 trên sân). Đội hình nền 3-2-2 theo hình anh Cường (3 hậu vệ, 3 tiền vệ, 1 tiền đạo).
- Repo public + ảnh thật: user đồng ý 2026-10-26.
- Ảnh "Ntl" tạm gán Linh 11, ảnh "anh Linh" gán Vũ Linh 8 (user chưa chắc).
- Static HTML/JS, không build; test `node --test`.
- Sa bàn động: mũi tên vẽ trước → cầu thủ chạy/bóng trượt (không xoay) theo thứ tự `arrows`; chú thích nhiệm vụ; xem lại.
- Đã bỏ theo yêu cầu user: tab Thử thách, Bài học sau trận, bảng nhiệm vụ, "Tôi là", 5 tình huống trùng (còn 3), khu dự bị + thay người.
- Minh Hưng: có trong roster + avatar, chưa xếp vị trí nên ẩn.

## Next
- Thêm người mới / hiện Minh Hưng: thêm số áo + đặt vào DEFAULT_LINEUP trong js/data/roster.js (nếu cần ghế dự bị lại: code cũ ở commit 3296b52).
- Chiến thuật/tình huống mới: js/data/tactics.js (npm test bắt lỗi tọa độ).
- Gợi ý tình huống chưa có: phạt góc phòng ngự, đá phạt gần vòng cấm, phản công 3 đánh 2.

## Risks
- Chưa thử trên điện thoại thật (chỉ Chrome giả lập 360–430px + xoay ngang).
- og:image cố định URL https://vovanduc.github.io/htx-football/… — đổi tên repo thì sửa index.html.
