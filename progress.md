# Session Progress Log

## Current State
**Last Updated:** 2026-10-26
**Active Feature:** feat-002 - Deploy GitHub Pages (chờ user OK bản local)

## Current Verified State
- `./init.sh` pass (npm test 13/13). Local: `npm run serve` → http://127.0.0.1:8077
- feat-001, feat-003, feat-004, feat-005 done (evidence trong feature_list.json). Tab Thử thách + Bài học đã bỏ theo yêu cầu user (code còn trong git history: commit 721801a).

## Decisions
- Sân 7 miền Nam = 7 cầu thủ + thủ môn (8 trên sân). Đội hình nền 3-2-2 theo hình anh Cường (3 hậu vệ, 3 tiền vệ, 1 tiền đạo).
- Repo public + ảnh thật: user đồng ý 2026-10-26.
- Ảnh "Ntl" tạm gán Linh 11, ảnh "anh Linh" gán Vũ Linh 8 (user chưa chắc).
- Static HTML/JS, không build; test `node --test`.
- og:image dùng URL tuyệt đối https://vovanduc.github.io/htx-football/… (đổi nếu repo khác tên).

## Next
- User OK → `gh repo create vovanduc/htx-football --public --source . --push`, bật Pages (main, /), kiểm tra URL 200.
- Chiến thuật mới: js/data/tactics.js; luật vàng: js/data/rules.js.
- Minh Hưng: có trong roster + avatar, chưa xếp vị trí nên ẩn. Muốn hiện: thêm số áo + đặt vào DEFAULT_LINEUP (js/data/roster.js).

## Decisions (feat-004)
- Bỏ bảng 'Nhiệm vụ từng người' + 'Tôi là' (user): nhiệm vụ hiện qua chú thích hoạt cảnh + thẻ khi chạm.
- Tình huống chỉ giữ 3 cái không trùng chiến thuật (user yêu cầu bỏ trùng/cơ bản).
- Cỡ token theo bề ngang sân (cqi) để không chen nhau khi sân nhỏ.

## Risks
- Kéo-thả quiz chưa thử trên điện thoại thật (chỉ Chrome headless mô phỏng touch).
