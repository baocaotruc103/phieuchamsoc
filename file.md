Dưới đây là **đề xuất cấu trúc phiếu chăm sóc điều dưỡng dạng checklist cho WebApp** (phù hợp khoa Hồi sức Ngoại, có thể dùng React + JSON data). Mình thiết kế theo kiểu **card UI + checklist + hỗ trợ AI gợi ý chẩn đoán/can thiệp**.

---

# PHIẾU CHĂM SÓC ĐIỀU DƯỠNG (CHECKLIST)

## 1. THÔNG TIN NGƯỜI BỆNH

**Card: Thông tin chung**

| Trường             | Kiểu              |
| ------------------ | ----------------- |
| Họ và tên          | text              |
| Mã bệnh án         | text              |
| Tuổi               | number            |
| Giới tính          | radio             |
| Buồng              | text              |
| Giường             | text              |
| Khoa               | text              |
| Chẩn đoán y khoa   | textarea          |
| Thời gian đánh giá | datetime          |
| Người đánh giá     | searchable select |

---

## 2. PHÂN CẤP CHĂM SÓC

**Card: Phân cấp**

Checklist dạng single select:

```text
☐ Chăm sóc cấp I
☐ Chăm sóc cấp II
☐ Chăm sóc cấp III
```

UI:

* màu đỏ: cấp I
* vàng: cấp II
* xanh: cấp III

---

## 3. BỘ LỌC GỢI Ý

**Card: Bộ lọc dữ liệu**

### Nhóm bệnh

Searchable dropdown

Ví dụ:

```text
[ Tim mạch ▼ ]
```

---

### Mặt bệnh

Searchable combobox:

* Cho phép gõ tìm kiếm toàn bộ danh mục
* Nếu đã chọn nhóm bệnh → ưu tiên lọc theo nhóm
* vẫn cho phép tìm toàn bộ nếu nhập keyword

Ví dụ:

```text
[ Suy tim cấp ▼ ]
```

---

# 4. NHẬN ĐỊNH ĐIỀU DƯỠNG

---

## Card: Dấu hiệu sinh tồn

```text
☐ Mạch:        [____] lần/phút
☐ Nhiệt độ:    [____] °C
☐ Huyết áp:    [____]/[____] mmHg
☐ Nhịp thở:    [____] lần/phút
☐ SpO₂:        [____] %
☐ Cân nặng:    [____] kg
☐ Chiều cao:   [____] cm
☐ BMI:         [ auto ]
```

BMI tự tính:

```js
BMI = cân_nặng / ((chiều_cao/100)^2)
```

---

## Card: Toàn thân

### Thể trạng

```text
☐ Gầy
☐ Trung bình
☐ Béo
```

### Ý thức

```text
☐ Tỉnh
☐ Lơ mơ
☐ Hôn mê
☐ Kích thích
☐ An thần
```

### Da niêm mạc

```text
☐ Hồng
☐ Nhợt
☐ Tím
☐ Vàng
☐ Khô
☐ Phù
```

---

## Card: Hô hấp

### Tình trạng thở

```text
☐ Tự thở
☐ Thở oxy
☐ HFNC
☐ NIV
☐ Thở máy
☐ Mở khí quản
```

Nếu chọn thở oxy:

```text
Loại oxy: [Canula/Mask]
Lưu lượng: [____] L/phút
```

Nếu thở máy:

```text
Mode: [____]
FiO2: [____]
PEEP: [____]
VT: [____]
```

---

## Card: Tuần hoàn

```text
☐ Ổn định
☐ Mạch nhanh
☐ Hạ huyết áp
☐ Sốc
☐ Có thuốc vận mạch
```

Nếu thuốc vận mạch:

```text
☐ Noradrenaline
☐ Adrenaline
☐ Dobutamine
☐ Vasopressin
Khác: ______
```

---

## Card: Tiêu hóa

### Bụng

```text
☐ Mềm
☐ Chướng
☐ Đau
☐ Có dẫn lưu
```

### Đại tiện

```text
☐ Bình thường
☐ Lỏng
☐ Táo
☐ Không đại tiện
```

---

## Card: Tiết niệu

```text
☐ Tự đi tiểu
☐ Sonde tiểu
☐ Thiểu niệu
☐ Vô niệu
```

Số lượng:

```text
[____] ml
```

---

## Card: Dinh dưỡng

```text
☐ Cơm
☐ Cháo
☐ Soup
☐ Sonde dạ dày
☐ Tĩnh mạch
☐ Nhịn ăn
```

Thực đơn:

```text
[________________]
```

---

## Card: Cơ quan bệnh

Textarea:

```text
Nhập nhận định cơ quan tổn thương...
```

Ví dụ:

* Hô hấp
* Tim mạch
* Tiêu hóa
* Thận
* Thần kinh

---

# 5. CHẨN ĐOÁN ĐIỀU DƯỠNG

## Gợi ý tự động theo bộ lọc

Ví dụ:

```text
☑ Giảm trao đổi khí
Mục tiêu: SpO₂ > 94%
                           [X]

☑ Nguy cơ nhiễm khuẩn
Mục tiêu: Không sốt, BC ổn định
                           [X]

☑ Đau cấp tính
Mục tiêu: Giảm đau VAS <3
                           [X]
```

UI:

* mỗi item là chip/card
* có nút X xóa
* có nút:

```text
+ Thêm chẩn đoán
```

Data source:

```json
chan_doan_dieu_duong.json
```

---

# 6. CAN THIỆP ĐIỀU DƯỠNG

Gợi ý theo:

* nhóm bệnh
* mặt bệnh
* chẩn đoán điều dưỡng

Ví dụ:

```text
☑ Theo dõi DHST 4 giờ/lần       [X]
☑ Theo dõi SpO₂ liên tục         [X]
☑ Chăm sóc NKQ                  [X]
☑ Hút đờm khi cần               [X]
☑ Thực hiện y lệnh thuốc        [X]
☑ Theo dõi dịch vào ra          [X]
```

Data:

```json
cd_dieu_duong.json
```

---

# 7. BÀN GIAO

Checklist:

```text
☐ Thuốc còn 1/2
☐ Lấy xét nghiệm
☐ Chờ kết quả xét nghiệm
☐ Lấy phim
☐ Chờ phim
☐ Thay băng
☐ Theo dõi dẫn lưu
☐ Theo dõi DHST
☐ Theo dõi nước tiểu
☐ Chăm sóc sonde
```

Khác:

```text
[________________________________]
```

---

# JSON SCHEMA GỢI Ý

```json
{
  "patient_info": {},
  "care_level": "",
  "disease_group": "",
  "disease_name": "",
  "assessment": {
    "vitals": {},
    "general": {},
    "respiratory": {},
    "circulation": {},
    "digestive": {},
    "nutrition": {},
    "organ_note": ""
  },
  "nursing_diagnosis": [],
  "interventions": [],
  "handover": {
    "checklist": [],
    "other": ""
  }
}
```

---

# UI GỢI Ý CHO WEBAPP

Layout mobile-first:

```text
[Thông tin NB]
[Phân cấp]
[Bộ lọc]
[Nhận định]
[Chẩn đoán]
[Can thiệp]
[Bàn giao]
[Lưu phiếu]
[Ký phiếu]
```

Mỗi section dạng accordion card.
Mình đề xuất nâng cấp phiếu thành:

Không phải phiếu trống nữa mà là phiếu checklist động:

1. NHẬN ĐỊNH CHUNG (mọi NB)

checkbox sẵn:
☐ DHST
☐ Ý thức
☐ Da niêm mạc
☐ Hô hấp
☐ Tuần hoàn
☐ Tiêu hóa
☐ Tiết niệu
☐ Dinh dưỡng
☐ Giấc ngủ
☐ Tinh thần
☐ Vận động
☐ VSCN
☐ Giáo dục sức khỏe

2. NHẬN ĐỊNH CHUYÊN KHOA THEO MẶT BỆNH

Ví dụ chọn Gãy xương đùi:
tự có checklist:

☐ Đau nhiều
☐ Sưng nề chi
☐ Mạch mu chân
☐ Cảm giác đầu chi
☐ Hồi lưu mao mạch
☐ Dẫn lưu vết mổ
☐ Nguy cơ loét tỳ đè
☐ Khả năng vận động

Ví dụ chọn Chảy máu tiêu hóa:
☐ Nôn máu
☐ Đi ngoài phân đen
☐ Mạch nhanh
☐ HA tụt
☐ Da niêm nhợt
☐ Dấu hiệu sốc
☐ Nước tiểu giảm

Ví dụ chọn Sau mổ sọ não
☐ Glasgow
☐ Đồng tử
☐ Dấu hiệu tăng ALNS
☐ Dẫn lưu sọ não
☐ Co giật
☐ Liệt khu trú
☐ Nôn vọt

3. CHẨN ĐOÁN ĐIỀU DƯỠNG

Auto checklist từ data:

Ví dụ gãy xương:
☐ Đau cấp tính
☐ Nguy cơ nhiễm trùng
☐ Nguy cơ loét tỳ đè
☐ Lo lắng
☐ Thiếu kiến thức

4. CAN THIỆP ĐIỀU DƯỠNG

Auto checklist:

☐ Theo dõi DHST
☐ Thực hiện y lệnh
☐ Theo dõi đau
☐ Chăm sóc vết mổ
☐ Theo dõi dẫn lưu
☐ PHCN
☐ GDSK