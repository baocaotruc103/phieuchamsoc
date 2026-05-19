// Table
text-[12px] font-semibold   // Header
text-[13px] font-normal     // Content

// Sidebar
text-[12px]

// Action labels
text-[11px]

// Module title
text-[13pt] font-bold uppercase

// Subtitle
text-[11px] font-bold uppercase

// Table title
text-center uppercase font-bold
# Quy chuẩn giao diện UI

| Nội dung | Cấu hình | Ghi chú |
|---------|----------|---------|
| **Cỡ chữ của bảng** | Header: `12px` <br> Content: `13px` | Áp dụng cho toàn bộ bảng dữ liệu |
| **Font chữ** | `sans-serif` (font hệ thống mặc định) | Tự động thay đổi theo thiết bị/hệ điều hành để tối ưu tốc độ tải và khả năng đọc:<br><br>• **Windows:** `Segoe UI`<br>• **macOS / iOS:** `San Francisco` (`-apple-system`)<br>• **Android / ChromeOS:** `Roboto`<br>• **Linux / Khác:** `Arial`, `Helvetica Neue`, `Noto Sans` |
| **Sidebar menu** | `12px` | Font chữ menu điều hướng bên trái |
| **Nhãn Action** | `11px` | Áp dụng cho button hành động / badge / action labels |
| **Module Titles** | Tiêu đề chính: `13pt` (`text-main-title`) <br> Phụ đề: `11px`, **bold**, `uppercase` | Chuẩn tiêu đề module |
| **Định dạng chữ thường** | `font-normal` | Không in đậm |
| **Tên module** | `"Vào viện / Chuyển khoa / Chuyển viện / Ra viện"` | Hiển thị đúng chuẩn naming |
| **Navigation Tabs** | `"Tổng quan"` / `"Danh sách"` / `"Báo cáo tổng hợp"` | Bộ tab mặc định cho module |
| **Tiêu đề bảng** | `text-center uppercase` | Căn giữa + in hoa toàn bộ tiêu đề bảng |

---

## CSS/Tailwind Mapping đề xuất

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;