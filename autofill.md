# Auto Fill Form from AI Pasted Table

## Mục tiêu
Cho phép người dùng copy bảng dữ liệu từ ChatGPT / NotebookLM và paste vào một ô đệm (textarea), sau đó bấm nút **Điền tự động** để hệ thống tự động parse dữ liệu và điền vào form chẩn đoán điều dưỡng.

Không sử dụng API AI. Xử lý hoàn toàn phía frontend bằng JavaScript/React.

---

## Giao diện yêu cầu

Thêm 1 block phía trên form:

- Textarea: "Dán dữ liệu từ ChatGPT / NotebookLM"
- Button: "Điền tự động"

Ví dụ:

```txt
[Dán nội dung AI vào đây.........................]

[Điền tự động]
```

---

## Định dạng dữ liệu đầu vào

Người dùng copy trực tiếp bảng markdown/text từ ChatGPT hoặc NotebookLM.

Ví dụ:

```txt
| Nhóm vấn đề | Vấn đề chăm sóc tham khảo | Yếu tố liên quan thường gặp | Mục tiêu tham khảo | Hoạt động chăm sóc tham khảo | Mã tham khảo |
| Hô hấp | Khó thở | Tăng tiết đờm dãi | Giảm khó thở, SpO2 ≥ 94% | Theo dõi nhịp thở; hút đờm; thở oxy | HH01 |
| Tuần hoàn | Nguy cơ tụt huyết áp | Mất máu sau mổ | Huyết áp ổn định | Theo dõi mạch; huyết áp; dịch truyền | TH02 |
| Đau | Đau cấp tính | Tổn thương mô sau phẫu thuật | Giảm đau | Đánh giá VAS; dùng thuốc giảm đau | D03 |
```

Cho phép nhiều dòng.

---

## Mapping cột dữ liệu

| Cột nguồn | Trường form |
|---------|-------------|
| Nhóm vấn đề | nhom_van_de |
| Vấn đề chăm sóc tham khảo | van_de |
| Yếu tố liên quan thường gặp | nguyen_nhan |
| Mục tiêu tham khảo | muc_tieu |
| Hoạt động chăm sóc tham khảo | can_thiep |
| Mã tham khảo | ma_can_thiep |

---

## Logic xử lý

### 1. Parse text
- split theo newline
- loại bỏ dòng trống
- bỏ dòng header chứa "Nhóm vấn đề"
- chỉ xử lý các dòng có ký tự "|"

---

### 2. Tách cột
Mỗi dòng:

```js
line.split("|")
```

sau đó:

```js
trim()
filter(Boolean)
```

---

### 3. Tạo object chuẩn

```js
{
  nhom_van_de: "",
  van_de: "",
  nguyen_nhan: "",
  muc_tieu: "",
  can_thiep: "",
  ma_can_thiep: ""
}
```

---

### 4. Đổ dữ liệu vào form
Nếu dữ liệu có nhiều dòng:
- tự động render tương ứng nhiều block chẩn đoán điều dưỡng
- ví dụ 5 dòng → tạo 5 block form

---

## React Parser

```javascript
function parseTableText(text) {
  const lines = text
    .trim()
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);

  const dataLines = lines.filter(line =>
    line.includes("|") &&
    !line.toLowerCase().includes("nhóm vấn đề")
  );

  return dataLines.map(line => {
    const cols = line
      .split("|")
      .map(x => x.trim())
      .filter(Boolean);

    return {
      nhom_van_de: cols[0] || "",
      van_de: cols[1] || "",
      nguyen_nhan: cols[2] || "",
      muc_tieu: cols[3] || "",
      can_thiep: cols[4] || "",
      ma_can_thiep: cols[5] || "",
    };
  });
}
```

---

## State React

```javascript
const [rawAiText, setRawAiText] = useState("");
const [diagnosisRows, setDiagnosisRows] = useState([]);
```

---

## Auto Fill Action

```javascript
function handleAutoFill() {
  const parsedRows = parseTableText(rawAiText);
  setDiagnosisRows(parsedRows);
}
```

---

## UI Component

```jsx
<div className="bg-yellow-50 border rounded-xl p-4 mb-4">
  <label>Dán dữ liệu từ ChatGPT / NotebookLM</label>

  <textarea
    value={rawAiText}
    onChange={(e) => setRawAiText(e.target.value)}
    placeholder="Paste bảng dữ liệu AI vào đây"
    className="w-full min-h-[180px]"
  />

  <button onClick={handleAutoFill}>
    Điền tự động
  </button>
</div>
```

---

## Render Dynamic Form

```jsx
{diagnosisRows.map((row, index) => (
  <DiagnosisFormItem
    key={index}
    data={row}
  />
))}
```

---

## UX yêu cầu
- Button "Điền tự động"
- Button "Xóa dữ liệu đã dán"
- Toast:
  - "Đã điền 5 chẩn đoán"
  - "Không tìm thấy dữ liệu hợp lệ"

---

## Validation
Nếu số cột < 6:

bỏ qua dòng đó.

---

## Mobile UI
Textarea full width.

Desktop:
- textarea phía trên
- form bên dưới

---

## Không làm
Không gọi:
- OpenAI API
- Gemini API
- NotebookLM API

Chỉ parse text local frontend.