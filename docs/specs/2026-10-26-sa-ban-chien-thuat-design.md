# Sa bàn chiến thuật HTX4.0 Football Club — Design

Ngày: 2026-10-26 · Chủ repo: Đức (#7) · Đội trưởng: Cường (#9)

## Ý định
Trang web vui cho team HTX4.0 FC (sân 7 miền Nam) nhưng mục tiêu thật là **đá đúng vị trí, đúng chiến thuật**. Mỗi người mở link (thường trên điện thoại, nhóm Zalo) → thấy mình đứng đâu, làm gì trong từng chiến thuật / tình huống. Sau mỗi trận team rút bài học và thêm chiến thuật mới.

## Quyết định từ user
- Sân 7 miền Nam: **7 cầu thủ + thủ môn = 8 người trên sân** (luật không tính thủ môn).
- Đội hình chính thức tạm thời: hình anh Cường gửi — **3-2-2** (đọc thực tế: 3 hậu vệ, 3 tiền vệ, 1 tiền đạo):
  GK Diệp 1 · Hậu vệ Linh 11 (trái), Vũ Linh 8 (giữa), Thiên 6 (phải) · Tiền vệ Sơn 10 (trái), Đức 7 (giữa), Quân 17 (phải) · Tiền đạo Cường 9 (C).
- Dự bị: Minh Hưng (chưa có số).
- Ảnh avatar thật từ Zalo, repo **public** + GitHub Pages (user đồng ý công khai). Ảnh "Ntl" tạm gán Linh 11; ảnh "anh Linh" gán Vũ Linh 8 — đổi được trong `js/data/roster.js`.
- Mobile-first. Chạy local OK rồi mới lên Pages.
- Áo đội: xanh ngọc (teal) theo ảnh mẫu.

## Mục tiêu
1. Sa bàn dọc (khung điện thoại), cầu thủ = avatar tròn + số áo + tên; đội trưởng đeo băng "C".
2. **6 chiến thuật toàn đội**, mỗi cái có 2 pha **Tấn công / Phòng thủ**; bấm → cầu thủ trượt (animation) tới vị trí mới; đối thủ (chấm đỏ) + bóng hiển thị theo pha.
3. **Tình huống** (scenarios) đơn khung: bóng ở cánh trái/phải, bóng trung lộ, đối thủ có bóng ở cánh, đối thủ có bóng trung lộ, thủ môn phát bóng, mất bóng (phản pressing 5 giây), phạt góc.
4. Mỗi khung có **nhiệm vụ cho từng vị trí** (nghiêm túc, 1 dòng) + **câu đùa** (1 dòng) + "độ mệt" + "khi nào dùng".
5. Bấm vào cầu thủ → thẻ nhiệm vụ của người đó trong khung hiện tại. Chọn "Tôi là…" → highlight bản thân.
6. **Thử thách "Đứng đúng chỗ"**: random khung + vị trí, kéo cầu thủ tới chỗ đúng → chấm điểm theo khoảng cách, hiện vị trí đúng.
7. **Thay người**: chọn dự bị → chọn người trên sân để hoán đổi (lưu localStorage, có nút reset).
8. **Bài học sau trận**: danh sách từ `js/data/lessons.js` (thêm bằng commit).

## Ngoài phạm vi
Backend, đăng nhập, chỉnh sửa chiến thuật trên web, nhiều đội hình nền khác ngoài 3-2-2 (thêm sau dưới dạng data).

## Anti-goals
Đùa gây khó chịu về cá nhân thật (đùa nhắm vào chiến thuật/vai trò, không vào ngoại hình/con người). Tọa độ sai bóng đá (hậu vệ dâng cao hơn tiền đạo khi phòng thủ…). Trang nặng/không chạy trên điện thoại.

## Kỹ thuật (lựa chọn của Claude)
- HTML/CSS/JS thuần, ES modules, **không build, không dependency** → GitHub Pages phục vụ thẳng từ `main` root.
- Tọa độ chuẩn hóa: `x` 0–100 trái→phải, `y` 0–100 (0 = khung thành đối phương ở trên, 100 = khung thành mình ở dưới). Cầu thủ đặt bằng `left/top %` + CSS transition.
- Data-driven: `roster.js` (người + slot), `tactics.js` (chiến thuật/tình huống → frame `{ball, us:{slot:[x,y]}, them:[[x,y]…], arrows, duties, joke}`), `lessons.js`.
- Logic thuần ở `js/engine.js` (gán slot→người, thay người, chấm điểm quiz) — test bằng `node --test`, kèm test toàn vẹn data (đủ 8 slot, tọa độ trong sân, số áo không trùng, avatar tồn tại).
- Verify UI bằng trình duyệt thật ở khổ 390px và desktop.

## Nguồn tham khảo chiến thuật
worldclasscoaching.com (3-2-1 7v7, pressing), themastermindsite.com (2-3-1 pressing, 8v8 formations), soccerhelp.com (8v8 formations), renderfoot.com (7v7 formations). Áp dụng: giữ trung lộ chắc, hậu vệ biên dâng khi đội cầm bóng, tạo tam giác ở cánh, pressing ngay khi mất bóng, khối thấp + phản công khi đối thủ mạnh hơn.
