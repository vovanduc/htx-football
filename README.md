# HTX4.0 Football Club · Sa bàn chiến thuật

Sa bàn chiến thuật sân 7 (7 cầu thủ + thủ môn) cho HTX4.0 FC. Vui là chính.

- **Chiến thuật**: 6 chiến thuật toàn đội, mỗi cái có pha Tấn công và Phòng thủ.
- **Tình huống**: thủ môn phát bóng, phạt góc tấn công, vừa mất bóng (5 giây vàng).
- **Sa bàn động**: bấm chọn → màn "Tuýt!" → mũi tên vẽ trước, rồi từng cầu thủ chạy / bóng lăn theo chiến thuật, chú thích nhiệm vụ của người đang chạy, cuối cùng là "↻ Xem lại".
- **Đội**: đội hình dự kiến, danh sách, áo đấu, luật vàng.
- Chạm vào cầu thủ để xem kỹ nhiệm vụ của người đó.
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
| Thêm hoặc sửa chiến thuật, tình huống | `js/data/tactics.js` (tọa độ `[x, y]` 0–100, `y = 0` là khung thành đội bạn; `arrows` theo thứ tự = thứ tự cầu thủ chạy trong hoạt cảnh) |
| Sửa luật vàng | `js/data/rules.js` |

Sau khi sửa, chạy `npm test`. Test sẽ báo nếu thiếu vị trí, tọa độ ra ngoài sân hoặc thủ môn đứng cao hơn hậu vệ. Trước khi deploy nên mở thử trên điện thoại.

## Ghi chú
- Ảnh "Ntl" đang tạm gán cho Linh #11. Nếu sai, đổi `avatar` trong `roster.js`.
- Tham khảo chiến thuật: worldclasscoaching.com, themastermindsite.com, soccerhelp.com, renderfoot.com.
