# HTX4.0 Football Club · Sa bàn chiến thuật

Sa bàn sân 7 miền Nam (7 cầu thủ + thủ môn) cho HTX4.0 FC. Vui là chính, nhưng phải đá đúng vị trí.

- **Chiến thuật**: 6 chiến thuật toàn đội, mỗi cái có pha Tấn công và Phòng thủ. Bấm vào thì cầu thủ trượt tới vị trí mới.
- **Tình huống**: bóng ở cánh, bóng ở trung lộ, thủ môn phát bóng, phạt góc, mất bóng (5 giây vàng)…
- **Thử thách**: kéo cầu thủ về đúng vị trí, có chấm điểm. Chọn "Tôi là…" để được hỏi về vị trí của mình.
- **Đội**: danh sách, áo đấu, luật vàng, bài học sau trận.
- Có thể gửi link thẳng tới một chiến thuật, ví dụ `#tab=tactic&t=pressing-cao&p=defend`.

## Chạy local

```bash
npm run serve        # http://127.0.0.1:8077
npm test             # test logic + toàn vẹn dữ liệu
```

Không cần build, không có dependency. GitHub Pages phục vụ trực tiếp từ nhánh `main`.

## Sửa nội dung

| Muốn… | Sửa file |
|---|---|
| Đổi tên, số áo, avatar, đội hình mặc định | `js/data/roster.js` (ảnh để trong `assets/avatars/`, khuyến nghị 320×320 jpg) |
| Thêm hoặc sửa chiến thuật, tình huống | `js/data/tactics.js` (tọa độ `[x, y]` 0–100, `y = 0` là khung thành đội bạn) |
| Ghi bài học sau trận | `js/data/lessons.js`: thêm mục mới lên đầu mảng `LESSONS` |

Sau khi sửa, chạy `npm test`. Test sẽ báo nếu thiếu vị trí, tọa độ ra ngoài sân hoặc thủ môn đứng cao hơn hậu vệ.

## Ghi chú
- Ảnh "Ntl" đang tạm gán cho Linh #11. Nếu sai, đổi `avatar` trong `roster.js`.
- Tham khảo chiến thuật: worldclasscoaching.com, themastermindsite.com, soccerhelp.com, renderfoot.com.
