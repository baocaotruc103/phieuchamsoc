const app = document.querySelector("#app");

const state = {
  raw: null,
  data: null,
  screen: "patients",
  hasCareSheet: false,
  selectedPatientIndex: 0,
  categoryId: "",
  departmentId: "",
  conditionId: "",
  careLevel: "1",
  search: "",
  patient: {
    name: "",
    code: "",
    age: "",
    sex: "",
    room: "",
    bed: "",
    department: "",
    diagnosis: "",
    date: new Date().toISOString().slice(0, 10),
  },
  selectedAssessments: new Set(),
  assessmentEdits: {},
  assessmentChecklist: {
    evalTime: new Date().toISOString().slice(0, 16),
    evaluator: "2272 | Nguyễn Văn Thiện",
    pulse: "",
    temperature: "",
    bloodPressure: "",
    weight: "",
    height: "",
    bmi: "",
    bodyType: "",
    consciousness: "",
    mucosa: "",
    edema: "",
    breathingMode: "",
    oxygenFlow: "",
    ventilatorMode: "",
    fio2: "",
    peep: "",
    vt: "",
    respiratoryRate: "",
    spo2: "",
    circulationStable: false,
    circulationFastPulse: false,
    circulationHypotension: false,
    circulationShock: false,
    circulationVasopressor: false,
    vasopressorNoradrenaline: false,
    vasopressorAdrenaline: false,
    vasopressorDobutamine: false,
    vasopressorVasopressin: false,
    vasopressorOther: "",
    abdomen: "",
    stool: "",
    urinary: [],
    urineAmount: "",
    nutritionType: [],
    menu: "",
    circulationNote: "",
    respiratoryNote: "",
    diseasedOrgan: "",
    fallRiskAssessment: false,
    vteRiskAssessment: false,
    painAssessment: false,
    pressureUlcerRiskAssessment: false,
    glasgowAssessment: false,
    handoverMedicineHalf: false,
    handoverLab: false,
    handoverWaitLab: false,
    handoverFilm: false,
    handoverWaitFilm: false,
    handoverDressing: false,
    handoverDrain: false,
    handoverVitals: false,
    handoverUrine: false,
    handoverTube: false,
    handoverOther: "",
  },
  diagnosisRows: [],
  interventionRows: [],
};

const patients = [
  { stt: 1, name: "NGUYỄN THỊ HƯỞNG", code: "23126929", sex: "Nữ", age: 76, object: "BH - HT2", room: "--", date: "11:23, ngày\n18-05-2026", day: 1, active: true },
  { stt: 2, name: "LÊ THỊ XUYẾN", code: "26060524", sex: "Nữ", age: 95, object: "BH - CK2", room: "Hồi sức tích cực\nbổ sung thêm 3", date: "10:18, ngày\n18-05-2026", day: 1 },
  { stt: 3, name: "NGUYỄN TIẾN HUỲNH", code: "26078296", sex: "Nam", age: 35, object: "VP", room: "Hồi sức tích cực\nbổ sung thêm 7", date: "22:00, ngày\n17-05-2026", day: 2 },
  { stt: 4, name: "NGUYỄN VĂN HÙNG", code: "25068076", sex: "Nam", age: 73, object: "BH - GD4", room: "--", date: "14:35, ngày\n17-05-2026", day: 2 },
  { stt: 5, name: "BÙI XUÂN HÒA", code: "26078061", sex: "Nam", age: 17, object: "BH - HS4", room: "--", date: "22:08, ngày\n16-05-2026", day: 3 },
  { stt: 6, name: "CHU VĂN LAN", code: "26055114", sex: "Nam", age: 69, object: "BH - GB4", room: "--", date: "15:02, ngày\n15-05-2026", day: 4 },
  { stt: 7, name: "HÀ THỊ TƯƠNG", code: "26076897", sex: "Nữ", age: 53, object: "BH - DT2", room: "--", date: "13:25, ngày\n15-05-2026", day: 4 },
  { stt: 8, name: "NGUYỄN THANH HÀ", code: "26077344", sex: "Nam", age: 57, object: "VP", room: "--", date: "11:39, ngày\n15-05-2026", day: 4 },
  { stt: 9, name: "NGUYỄN ĐẮC THẮNG", code: "26077163", sex: "Nam", age: 22, object: "BH - GD4", room: "--", date: "01:34, ngày\n15-05-2026", day: 4 },
  { stt: 10, name: "VŨ VĂN NGHĨA", code: "26067081", sex: "Nam", age: 67, object: "BH - CK2", room: "Hồi sức tích cực\n5", date: "15:54, ngày\n13-05-2026", day: 6 },
];

const modules = [
  { label: "Xét Nghiệm", icon: "⚗", color: "#7c3aed", badge: 4 },
  { label: "Hình Ảnh", icon: "♙", color: "#0ea5e9", badge: 3 },
  { label: "Chuyên Khoa", icon: "♬", color: "#dc2626", badge: 1 },
  { label: "Thuốc", icon: "⌁", color: "#22c55e", badge: 10 },
  { label: "Vật Tư", icon: "▰", color: "#f97316", badge: 2 },
  { label: "EMR", icon: "✍", color: "#6366f1" },
  { label: "P.Điều Trị", icon: "✚", color: "#14b8a6", badge: 14 },
  { label: "Lịch Sử", icon: "↶", color: "#3b82f6" },
  { label: "Tài liệu", icon: "▤", color: "#8b5cf6" },
  { label: "Bệnh án", icon: "▰", color: "#f59e0b", action: "record-menu" },
  { label: "Xác thực", icon: "☺", color: "#10b981" },
  { label: "Viện Phí", icon: "◉", color: "#ef4444" },
  { label: "QL.Công Khai", icon: "◔", color: "#06b6d4" },
  { label: "QL.Y Lệnh", icon: "▣", color: "#ec4899" },
];

const sectionLabels = {
  cham_soc_dieu_duong: "Nhận định chăm sóc",
  dau_hieu_sinh_ton: "Dấu hiệu sinh tồn",
  toan_than: "Toàn thân",
  tuan_hoan: "Tuần hoàn",
  ho_hap: "Hô hấp",
  tieu_hoa: "Tiêu hóa",
  co_quan_bi_benh: "Cơ quan bị bệnh",
  dinh_duong: "Dinh dưỡng",
  giac_ngu: "Giấc ngủ",
  ve_sinh_ca_nhan: "Vệ sinh cá nhân",
  tinh_than: "Tinh thần",
  van_ong_phcn: "Vận động, PHCN",
  giao_duc_suc_khoe: "Giáo dục sức khỏe",
  theo_doi_khac: "Theo dõi khác",
  khac: "Khác",
};

const diagnosisKeys = [
  "chan_oan",
  "chan_oan_ieu_duong",
  "chan_oan_ieu_duong_o_bai_nay_nen_uu_tien_nguy_co_soc_cua_nguoi_benh_la_chan_oan_",
];

const interventionKey = "can_thiep_dieu_duong";

const cp1252 = {
  0x20ac: 0x80,
  0x201a: 0x82,
  0x0192: 0x83,
  0x201e: 0x84,
  0x2026: 0x85,
  0x2020: 0x86,
  0x2021: 0x87,
  0x02c6: 0x88,
  0x2030: 0x89,
  0x0160: 0x8a,
  0x2039: 0x8b,
  0x0152: 0x8c,
  0x017d: 0x8e,
  0x2018: 0x91,
  0x2019: 0x92,
  0x201c: 0x93,
  0x201d: 0x94,
  0x2022: 0x95,
  0x2013: 0x96,
  0x2014: 0x97,
  0x02dc: 0x98,
  0x2122: 0x99,
  0x0161: 0x9a,
  0x203a: 0x9b,
  0x0153: 0x9c,
  0x017e: 0x9e,
  0x0178: 0x9f,
};

function fixMojibake(value) {
  if (typeof value !== "string") return value;
  if (!/[ÃÄÆáÂ»ÂºÂ£Â¡]/.test(value)) return value;
  try {
    const bytes = [];
    for (const char of value) {
      const code = char.codePointAt(0);
      if (code <= 255) bytes.push(code);
      else if (cp1252[code]) bytes.push(cp1252[code]);
      else return value;
    }
    return new TextDecoder("utf-8", { fatal: false }).decode(new Uint8Array(bytes));
  } catch {
    return value;
  }
}

function deepFix(value) {
  if (typeof value === "string") return fixMojibake(value);
  if (Array.isArray(value)) return value.map(deepFix);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, deepFix(item)]));
  }
  return value;
}

function byId(items, id) {
  return items.find((item) => item.id === id);
}

function currentCategory() {
  return byId(state.data.categories, state.categoryId) || state.data.categories[0];
}

function currentDepartment() {
  const category = currentCategory();
  return byId(category.khoa, state.departmentId) || category.khoa[0];
}

function currentCondition() {
  const department = currentDepartment();
  return byId(department.mat_benh, state.conditionId) || department.mat_benh[0];
}

function allConditionEntries() {
  return state.data.categories.flatMap((category) =>
    category.khoa.flatMap((department) =>
      department.mat_benh.map((condition) => ({ category, department, condition })),
    ),
  );
}

function searchedConditionEntries() {
  const keyword = cleanLine(state.search).toLowerCase();
  const entries = allConditionEntries();
  const scoped = entries.filter(
    (entry) => entry.category.id === state.categoryId && entry.department.id === state.departmentId,
  );
  if (!keyword) return scoped;
  return entries
    .filter((entry) =>
      [
        entry.condition.ten_mat_benh,
        entry.department.ma_khoa,
        entry.department.ten_khoa,
        entry.category.ten_nhom,
      ]
        .filter(Boolean)
        .some((value) => cleanLine(value).toLowerCase().includes(keyword)),
    )
    .slice(0, 80);
}

function sectionLabel(key, section) {
  return section?.label || sectionLabels[key] || key.replaceAll("_", " ");
}

function normalizeItems(section) {
  if (!section) return [];
  if (Array.isArray(section.items)) return section.items;
  if (Array.isArray(section.rows)) return section.rows;
  return [];
}

function assessmentSections(condition) {
  const sections = condition.sections || {};
  const keys = Object.keys(sections).filter(
    (key) => !diagnosisKeys.includes(key) && key !== interventionKey,
  );
  return keys.flatMap((key) =>
    normalizeItems(sections[key])
      .filter((item) => item.noi_dung || item.ket_qua)
      .map((item, index) => ({
        id: `${condition.id}:${key}:${index}`,
        label: sectionLabel(key, sections[key]),
        prompt: cleanLine(item.noi_dung || sectionLabel(key, sections[key])),
        result: cleanLine(item.ket_qua || item.noi_dung || ""),
      })),
  );
}

function cleanLine(text) {
  return String(text || "")
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^[\s-]+/, "")
    .trim();
}

function splitBullets(text) {
  return String(text || "")
    .split(/\n|(?=\s*-\s+)/)
    .map((line) => cleanLine(line.replace(/^\s*-\s*/, "")))
    .filter(Boolean);
}

function diagnosisSuggestions(condition) {
  const sections = condition.sections || {};
  const items = diagnosisKeys.flatMap((key) => normalizeItems(sections[key]));
  const lines = items.flatMap((item) => splitBullets([item.noi_dung, item.ket_qua].filter(Boolean).join("\n")));
  const rows = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const next = lines[index + 1] || "";
    const isGoal = /mục tiêu/i.test(line);
    if (isGoal) continue;
    const goal = /mục tiêu/i.test(next) ? next.replace(/^mục tiêu\s*\d*\s*:\s*/i, "") : "";
    rows.push({
      id: `dx-${rows.length}`,
      selected: true,
      diagnosis: line.replace(/^chẩn đoán\s*\d*\s*:\s*/i, ""),
      goal,
    });
  }
  return rows.length ? rows : [{ id: "dx-0", selected: true, diagnosis: "", goal: "" }];
}

function codeForIntervention(text, index) {
  const source = text.toLowerCase();
  if (source.includes("tri giác") || source.includes("glasgow")) return "TD-S101";
  if (source.includes("dấu hiệu sinh tồn") || source.includes("mạch") || source.includes("huyết áp")) return "TD-S102";
  if (source.includes("dẫn lưu")) return "CS-D204";
  if (source.includes("thay băng") || source.includes("vết mổ")) return "CS-G203";
  if (source.includes("đau") || source.includes("giảm đau")) return "CS-D105";
  if (source.includes("dinh dưỡng") || source.includes("ăn")) return "DD-N301";
  if (source.includes("vệ sinh")) return "CS-V401";
  if (source.includes("giáo dục") || source.includes("hướng dẫn") || source.includes("tư vấn")) return "GD-S501";
  if (source.includes("vận động") || source.includes("phục hồi")) return "PH-V601";
  return `CS-T${String(index + 1).padStart(3, "0")}`;
}

function interventionSuggestions(condition) {
  const section = condition.sections?.[interventionKey];
  const lines = normalizeItems(section).flatMap((item) =>
    splitBullets([item.noi_dung, item.ket_qua].filter(Boolean).join("\n")),
  );
  return (lines.length ? lines : [""]).map((content, index) => ({
    id: `iv-${index}`,
    selected: Boolean(content),
    code: codeForIntervention(content, index),
    content,
  }));
}

function resetForCondition() {
  const condition = currentCondition();
  state.selectedAssessments = new Set();
  state.assessmentEdits = {};
  state.diagnosisRows = diagnosisSuggestions(condition);
  state.interventionRows = interventionSuggestions(condition);
  render();
}

function ensureSelection() {
  const category = currentCategory();
  state.categoryId = category.id;
  const department = currentDepartment();
  state.departmentId = department.id;
  const condition = currentCondition();
  state.conditionId = condition.id;
}

function h(text) {
  return String(text ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function textPreview(text, max = 92) {
  const value = cleanLine(text).replace(/\s+/g, " ");
  return value.length > max ? `${value.slice(0, max)}...` : value;
}

function appBar(title, backTarget = "") {
  return `
    <header class="app-bar">
      <button class="nav-icon" ${backTarget ? `data-screen="${backTarget}"` : ""} aria-label="Quay lại">‹</button>
      <h1>${h(title)}</h1>
      <button class="grid-icon" data-screen="patients" aria-label="Danh sách">
        <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
      </button>
    </header>
  `;
}

function renderPatientListScreen() {
  return `
    <div class="mobile-app patient-list-screen">
      ${appBar("(Tất Cả Khoa Phòng)")}
      <section class="search-bar">
        <span class="search-icon">⌕</span>
        <input placeholder="Tìm kiếm..." />
        <button class="filter-icon">☷</button>
        <button class="qr-icon">▦</button>
      </section>
      <div class="patient-table-head">
        <span>STT Bệnh nhân</span><span>Đối tượng</span><span>Tuổi</span><span>Buồng/Giường</span><span>Ngày khám</span><span>Ngày</span>
      </div>
      <section class="patient-list">${patients.map(renderPatientRow).join("")}</section>
      <footer class="bottom-filter">
        <span class="active">Tất cả <b>27</b></span>
        <span>Đang điều trị <b>22</b></span>
        <span>Đã kết thúc <b>4</b></span>
        <span>Đã chuyển khoa <b>5</b></span>
        <span>BN BHYT <b>24</b></span>
      </footer>
    </div>
  `;
}

function renderPatientRow(patient, index) {
  const isFemale = patient.sex === "Nữ";
  return `
    <button class="patient-row ${index === state.selectedPatientIndex ? "active" : ""}" data-patient-index="${index}">
      <span class="stt">${patient.stt}</span>
      <span class="avatar ${isFemale ? "female" : "male"}"><span></span></span>
      <span class="patient-main"><strong>${h(patient.name)}</strong><small>${h(patient.code)}</small></span>
      <span class="object-pill ${patient.object === "VP" ? "vp" : ""}">${h(patient.object)}</span>
      <span class="age">${patient.age} tuổi<br><small>${h(patient.sex)}</small></span>
      <span class="room">${h(patient.room).replace(/\n/g, "<br>")}</span>
      <span class="date">${h(patient.date).replace(/\n/g, "<br>")}</span>
      <span class="day-badge">${patient.day}</span>
    </button>
  `;
}

function renderRecordScreen() {
  const patient = patients[state.selectedPatientIndex] || patients[0];
  const birthYear = new Date().getFullYear() - patient.age;
  return `
    <div class="mobile-app record-screen">
      ${appBar(`Hồ Sơ Bệnh Án - (${patient.code})`, "patients")}
      <section class="record-card">
        <div class="record-title">
          <h2>${h(patient.name)}</h2>
          <span>${h(patient.sex)}</span>
          <strong>${patient.age} tuổi (${birthYear})</strong>
          <em><b>${patient.day}</b> ngày nằm viện</em>
        </div>
        <div class="record-columns">
          <div>
            <h3>THÔNG TIN CHUNG</h3>
            ${infoLine("NGHỀ NGHIỆP:", "Hưu trí và trên 60 tuổi")}
            ${infoLine("ĐỊA CHỈ:", "Bảo hiểm | BHYT Thường")}
            ${infoLine("ĐỐI TƯỢNG:", "BHYT", "blue")}
            ${infoLine("BẢO HIỂM:", "VP: 2479334 | BH: HT-2-25-262000 1734 | Còn 1689 ngày", "red")}
          </div>
          <div>
            <h3>THÔNG TIN ĐÓN TIẾP</h3>
            ${infoLine("THỜI GIAN:", "05:31 18-05-2026")}
            ${infoLine("HÌNH THỨC:", "Cấp cứu")}
            ${infoLine("LÝ DO KHÁM:", "1")}
            ${infoLine("MỨC HƯỞNG:", "40%", "blue")}
          </div>
          <div>
            <h3>LÂM SÀNG & ĐIỀU TRỊ</h3>
            ${infoLine("SỐ VÀO VIỆN:", "032119/26", "blue")}
            ${infoLine("SỐ VÀO KHOA:", "B11/00712/26", "blue")}
            ${infoLine("BỆNH ÁN:", "Ngoại khoa", "red")}
            ${infoLine("KHOA PHÒNG:", "Khoa Hồi Sức Ngoại > PĐT B11", "red")}
            ${infoLine("NGÀY VÀO:", patient.date.replace(", ngày\n", " "))}
            ${infoLine("BUỒNG/GIƯỜNG:", patient.room === "--" ? "---" : patient.room.replace(/\n/g, " "))}
          </div>
        </div>
      </section>
      <section class="module-grid">${modules.map(renderModule).join("")}</section>
    </div>
  `;
}

function infoLine(label, value, tone = "") {
  return `<p><span>${h(label)}</span><strong class="${tone}">${h(value)}</strong></p>`;
}

function renderModule(item) {
  return `
    <button class="module-item" ${item.action ? `data-action="${item.action}"` : ""}>
      <span class="module-icon" style="background:${item.color}">
        <i>${item.icon}</i>
        ${item.badge ? `<b>${item.badge}</b>` : ""}
      </span>
      <strong>${h(item.label)}</strong>
    </button>
  `;
}

function renderRecordMenuScreen() {
  const items = ["Phiếu Chăm Sóc", "Phiếu Truyền dịch", "Phiếu chăm sóc kế hoạch", "Quản lý y lệnh"];
  return `
    <div class="mobile-app menu-screen">
      ${appBar("Hồ Sơ Bệnh Án", "record")}
      <section class="record-menu">
        ${items.map((item, index) => `
          <button class="menu-row" ${index === 0 ? 'data-screen="careEmpty"' : ""}>
            <span class="mini-doc">+</span>
            <strong>${h(item)}</strong>
            <em>›</em>
          </button>
        `).join("")}
      </section>
    </div>
  `;
}

function renderCareEmptyScreen() {
  if (state.hasCareSheet) {
    state.screen = "careForm";
    return render();
  }
  return `
    <div class="mobile-app empty-care-screen">
      ${appBar("Phiếu Chăm Sóc", "recordMenu")}
      <section class="empty-care">
        <div class="empty-doc-icon">+</div>
        <h2>Chưa có phiếu chăm sóc</h2>
        <p>Bệnh nhân chưa có phiếu chăm sóc nào. Nhấn nút bên dưới để tạo phiếu mới.</p>
        <button class="add-sheet-btn" data-action="create-care">⊕ Thêm phiếu mới</button>
      </section>
    </div>
  `;
}

function render(focusSelector = "") {
  ensureSelection();
  if (state.screen === "patients") {
    app.innerHTML = renderPatientListScreen();
    return;
  }
  if (state.screen === "record") {
    app.innerHTML = renderRecordScreen();
    return;
  }
  if (state.screen === "recordMenu") {
    app.innerHTML = renderRecordMenuScreen();
    return;
  }
  if (state.screen === "careEmpty") {
    app.innerHTML = renderCareEmptyScreen();
    return;
  }
  const category = currentCategory();
  const department = currentDepartment();
  const condition = currentCondition();
  const assessments = assessmentSections(condition);
  const filteredEntries = searchedConditionEntries();
  const filteredConditions = filteredEntries.map((entry) => ({
    ...entry.condition,
    categoryRef: entry.category.id,
    departmentRef: entry.department.id,
    departmentLabel: entry.department.ma_khoa || entry.department.ten_khoa,
  }));

  app.innerHTML = `
    <div class="mobile-app form-mode">
      ${appBar("Phiếu Chăm Sóc", "careEmpty")}
      <div class="form-actions">
        <button class="btn ghost" data-action="clear">Lưu phiếu và ký</button>
        <button class="btn primary" data-action="print">In phiếu</button>
      </div>

      <main class="layout">
        <aside class="rail">
          ${renderPatientPanel()}
          <section class="panel">
            <div class="panel-header">
              <div>
                <h2 class="panel-title">Chọn nhóm bệnh</h2>
                <p class="panel-subtitle">Chọn khối, khoa và mặt bệnh để nạp gợi ý.</p>
              </div>
              <span class="step-badge">1</span>
            </div>
            <div class="panel-body">
              <div class="filter-select-grid">
                <label class="field">
                  <span>Nhóm bệnh</span>
                  <select data-category-select>
                    ${state.data.categories.map((item) => `<option value="${h(item.id)}" ${item.id === category.id ? "selected" : ""}>${h(item.ten_nhom)}</option>`).join("")}
                  </select>
                </label>
                <label class="field">
                  <span>Khoa / nhóm mặt bệnh</span>
                  <select data-department-select>
                    ${category.khoa.map((item) => `<option value="${h(item.id)}" ${item.id === department.id ? "selected" : ""}>${h(item.ma_khoa || item.ten_khoa)} - ${h(item.ten_khoa)}</option>`).join("")}
                  </select>
                </label>
              </div>
              <div class="segmented">
                ${state.data.categories
                  .map(
                    (item) => `
                    <button class="btn ${item.id === category.id ? "active" : ""}" data-category="${h(item.id)}">
                      ${h(item.ten_nhom)}
                    </button>
                  `,
                  )
                  .join("")}
              </div>

              <div class="department-list">
                ${category.khoa
                  .map(
                    (item) => `
                    <button class="department-btn ${item.id === department.id ? "active" : ""}" data-department="${h(item.id)}">
                      <strong>${h(item.ma_khoa || item.ten_khoa)}</strong>
                      <span>${h(item.ten_khoa)} - ${item.mat_benh.length} mặt bệnh</span>
                    </button>
                  `,
                  )
                  .join("")}
              </div>

              <input class="search" type="search" placeholder="Tìm mặt bệnh..." value="${h(state.search)}" data-input="search" />
              <div class="condition-list">
                ${filteredConditions
                  .map(
                    (item) => `
                    <button class="condition-btn ${item.id === condition.id ? "active" : ""}" data-condition="${h(item.id)}" data-category-ref="${h(item.categoryRef)}" data-department-ref="${h(item.departmentRef)}">
                      <strong>${h(item.ten_mat_benh)}</strong>
                      <span>${h(item.departmentLabel)} · STT ${h(item.stt || "")}</span>
                    </button>
                  `,
                  )
                  .join("")}
              </div>
            </div>
          </section>
        </aside>

        <section class="workspace">
          ${renderAssessmentPanel(assessments)}
          ${renderDiagnosisPanel()}
          ${renderInterventionPanel()}
          ${renderHandoverPanel()}
          ${renderSheet(condition)}
        </section>
      </main>
    </div>
  `;

  if (focusSelector) {
    const focusTarget = app.querySelector(focusSelector);
    if (focusTarget) {
      focusTarget.focus();
      if (typeof focusTarget.setSelectionRange === "function") {
        const end = focusTarget.value.length;
        focusTarget.setSelectionRange(end, end);
      }
    }
  }
}

function renderPatientPanel() {
  return `${renderCareHeaderPanel()}${renderCareLevelPanel()}`;
}

function renderCareHeaderPanel() {
  const selected = patients[state.selectedPatientIndex] || patients[0];
  return `
    <section class="panel care-top-card">
      <div class="panel-header">
        <div>
          <h2 class="panel-title">Thông tin người bệnh</h2>
          <p class="panel-subtitle">${h(selected.name)} | Mã y tế: ${h(selected.code)} | ${h(selected.sex)} | ${selected.age} tuổi</p>
        </div>
      </div>
      <div class="panel-body">
        <div class="care-info-grid">
          ${checkField("evalTime", "Thời gian đánh giá", state.assessmentChecklist.evalTime, "datetime-local")}
          ${checkField("evaluator", "Người đánh giá", state.assessmentChecklist.evaluator)}
        </div>
      </div>
    </section>
  `;
}

function renderCareLevelPanel() {
  return `
    <section class="panel care-level-card">
      <div class="panel-header">
        <div>
          <h2 class="panel-title">Phân cấp chăm sóc</h2>
          <p class="panel-subtitle">Chọn cấp chăm sóc phù hợp cho lần đánh giá này.</p>
        </div>
      </div>
      <div class="panel-body">
        <div class="level-group">
          ${["1", "2", "3"].map((level) => `
            <button class="btn level-${level} ${state.careLevel === level ? "active" : ""}" data-level="${level}">CS cấp ${level}</button>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}

function renderOldPatientPanel() {
  return `
    <section class="panel">
      <div class="panel-header">
        <div>
          <h2 class="panel-title">Thông tin phiếu</h2>
          <p class="panel-subtitle">Chọn cấp chăm sóc và thông tin người bệnh.</p>
        </div>
      </div>
      <div class="panel-body">
        <div class="level-group">
          ${["1", "2", "3"]
            .map(
              (level) => `
              <button class="btn ${state.careLevel === level ? "active" : ""}" data-level="${level}">
                Cấp ${level}
              </button>
            `,
            )
            .join("")}
        </div>
        <div class="field-grid" style="margin-top: 12px;">
          ${field("name", "Họ tên NB", state.patient.name)}
          ${field("age", "Tuổi", state.patient.age)}
          ${field("date", "Ngày", state.patient.date, "date")}
          ${field("room", "Phòng", state.patient.room)}
          ${field("bed", "Giường", state.patient.bed)}
          ${field("diagnosis", "Chẩn đoán y khoa", state.patient.diagnosis)}
        </div>
      </div>
    </section>
  `;
}

function field(key, label, value, type = "text") {
  return `
    <div class="field">
      <label>${h(label)}</label>
      <input type="${type}" value="${h(value)}" data-patient="${key}" />
    </div>
  `;
}

function renderAssessmentPanel(assessments) {
  const check = state.assessmentChecklist;
  return `
    <section class="panel assessment-checklist-panel structured-assessment">
      <div class="panel-header">
        <div>
          <h2 class="panel-title">Nhận định điều dưỡng</h2>
          <p class="panel-subtitle">Cấu trúc theo file.md: dấu hiệu sinh tồn, toàn thân, hô hấp, tuần hoàn, tiêu hóa, tiết niệu, dinh dưỡng và cơ quan bệnh.</p>
        </div>
      </div>
      <div class="panel-body">
        <div class="assessment-section-card">
          <h3>Dấu hiệu sinh tồn</h3>
          <div class="care-info-grid vital-grid">
            ${checkField("pulse", "Mạch (lần/phút)", check.pulse)}
            ${checkField("temperature", "Nhiệt độ (°C)", check.temperature)}
            ${checkField("bloodPressure", "Huyết áp (mmHg)", check.bloodPressure)}
            ${checkField("respiratoryRate", "Nhịp thở (lần/phút)", check.respiratoryRate)}
            ${checkField("spo2", "SpO2 (%)", check.spo2)}
            ${checkField("weight", "Cân nặng (kg)", check.weight)}
            ${checkField("height", "Chiều cao (cm)", check.height)}
            ${checkField("bmi", "BMI tự tính", check.bmi)}
          </div>
        </div>

        <div class="assessment-section-card">
          <h3>Toàn thân</h3>
          <div class="assessment-form compact-form">
            ${radioGroup("bodyType", "Thể trạng", ["Gầy", "Trung bình", "Béo"], check.bodyType)}
            ${radioGroup("consciousness", "Ý thức", ["Tỉnh", "Lơ mơ", "Hôn mê", "Kích thích", "An thần"], check.consciousness)}
            ${radioGroup("mucosa", "Da niêm mạc", ["Hồng", "Nhợt"], check.mucosa)}
            ${radioGroup("edema", "Phù", ["Có", "Không"], check.edema)}
          </div>
        </div>

        <div class="assessment-section-card">
          <h3>Hô hấp</h3>
          <div class="assessment-form compact-form">
            ${radioGroup("breathingMode", "Tình trạng thở", ["Tự thở", "Thở oxy", "HFNC", "NIV", "Thở máy"], check.breathingMode)}
            ${renderRespiratoryDetails(check)}
            ${checkArea("respiratoryNote", "Ghi chú hô hấp", check.respiratoryNote)}
          </div>
        </div>

        <div class="assessment-section-card">
          <h3>Tuần hoàn</h3>
          <div class="handover-grid">
            ${checkBool("circulationStable", "Ổn định", check.circulationStable)}
            ${checkBool("circulationFastPulse", "Mạch nhanh", check.circulationFastPulse)}
            ${checkBool("circulationHypotension", "Hạ huyết áp", check.circulationHypotension)}
            ${checkBool("circulationShock", "Sốc", check.circulationShock)}
            ${checkBool("circulationVasopressor", "Có thuốc vận mạch", check.circulationVasopressor)}
          </div>
          ${renderVasopressorDetails(check)}
          ${checkArea("circulationNote", "Ghi chú tuần hoàn", check.circulationNote)}
        </div>

        <div class="assessment-section-card">
          <h3>Tiêu hóa</h3>
          <div class="assessment-form compact-form">
            ${radioGroup("abdomen", "Bụng", ["Mềm", "Chướng", "Đau", "Có dẫn lưu"], check.abdomen)}
            ${radioGroup("stool", "Đại tiện", ["Bình thường", "Lỏng", "Táo", "Không đại tiện"], check.stool)}
          </div>
        </div>

        <div class="assessment-section-card">
          <h3>Tiết niệu</h3>
          <div class="assessment-form compact-form">
            ${multiCheckGroup("urinary", "Tiểu tiện", ["Tự đi tiểu", "Tiểu qua sonde", "Thiểu niệu", "Vô niệu"], check.urinary)}
            ${checkField("urineAmount", "Số lượng (ml)", check.urineAmount)}
          </div>
        </div>

        <div class="assessment-section-card">
          <h3>Dinh dưỡng</h3>
          <div class="assessment-form compact-form">
            ${multiCheckGroup("nutritionType", "Dinh dưỡng", ["Cơm", "Cháo", "Soup", "Sonde dạ dày", "Tĩnh mạch", "Nhịn ăn"], check.nutritionType)}
            ${checkField("menu", "Thực đơn", check.menu)}
          </div>
        </div>

        <div class="assessment-section-card">
          <h3>Cơ quan bệnh</h3>
          ${checkArea("diseasedOrgan", "Nhập nhận định cơ quan tổn thương", check.diseasedOrgan)}
        </div>

        <div class="assessment-section-card">
          <h3>Thang điểm đánh giá</h3>
          <div class="assessment-form compact-form">
            ${checkBool("fallRiskAssessment", "Đánh giá nguy cơ té ngã", check.fallRiskAssessment)}
            ${checkBool("vteRiskAssessment", "Đánh giá nguy cơ viêm tĩnh mạch", check.vteRiskAssessment)}
            ${checkBool("painAssessment", "Đánh giá đau", check.painAssessment)}
            ${checkBool("pressureUlcerRiskAssessment", "Đánh giá nguy cơ loét tỳ đè", check.pressureUlcerRiskAssessment)}
            ${checkBool("glasgowAssessment", "Đánh giá Glasgow", check.glasgowAssessment)}
          </div>
        </div>
      </div>
    </section>
  `;
  return `
    <section class="panel assessment-checklist-panel structured-assessment">
      <div class="panel-header">
        <div>
          <h2 class="panel-title">Nhận định</h2>
          <p class="panel-subtitle">Nhập nhanh dấu hiệu sinh tồn, toàn thân, hô hấp, tiêu hóa, dinh dưỡng và cơ quan bệnh.</p>
        </div>
      </div>
      <div class="panel-body">
        <div class="assessment-section-card">
          <h3>Dấu hiệu sinh tồn</h3>
          <div class="care-info-grid vital-grid">
            ${checkField("pulse", "Mạch", check.pulse)}
            ${checkField("temperature", "Nhiệt độ", check.temperature)}
            ${checkField("bloodPressure", "Huyết áp", check.bloodPressure)}
            ${checkField("weight", "Cân nặng", check.weight)}
            ${checkField("height", "Chiều cao", check.height)}
            ${checkField("bmi", "BMI", check.bmi)}
          </div>
        </div>

        <div class="assessment-section-card">
          <h3>Toàn thân</h3>
          <div class="assessment-form compact-form">
            ${radioGroup("bodyType", "Thể trạng", ["Trung bình", "Gầy", "Béo"], check.bodyType)}
            ${radioGroup("consciousness", "Ý thức", ["Tỉnh", "Lơ mơ", "Hôn mê"], check.consciousness)}
            ${radioGroup("mucosa", "Da niêm mạc", ["Hồng", "Bình thường", "Nhợt"], check.mucosa)}
          </div>
        </div>

        <div class="assessment-section-card">
          <h3>Tuần hoàn, hô hấp</h3>
          <div class="assessment-form compact-form">
            ${radioGroup("breathingMode", "Hô hấp", ["Tự thở", "Thở hỗ trợ oxy", "Thở máy"], check.breathingMode)}
            ${checkField("respiratoryRate", "Nhịp thở", check.respiratoryRate)}
            ${checkField("spo2", "SpO2", check.spo2)}
            ${checkArea("circulationNote", "Tuần hoàn", check.circulationNote)}
            ${checkArea("respiratoryNote", "Ghi chú hô hấp", check.respiratoryNote)}
          </div>
        </div>

        <div class="assessment-section-card">
          <h3>Tiêu hóa, dinh dưỡng</h3>
          <div class="assessment-form compact-form">
            ${radioGroup("abdomen", "Bụng", ["Mềm", "Chướng"], check.abdomen)}
            ${radioGroup("stool", "Đại tiện", ["Bình thường", "Lỏng", "Rắn", "Không"], check.stool)}
            ${radioGroup("nutritionType", "Dinh dưỡng", ["Cơm", "Cháo", "Soup", "Thực đơn"], check.nutritionType)}
            ${checkField("menu", "Thực đơn", check.menu)}
          </div>
        </div>

        <div class="assessment-section-card">
          <h3>Cơ quan bệnh</h3>
          ${checkArea("diseasedOrgan", "Nhập thông tin cơ quan bệnh", check.diseasedOrgan)}
        </div>

        <div class="assessment-section-card">
          <h3>Thang điểm đánh giá</h3>
          <div class="assessment-form compact-form">
            ${checkBool("fallRiskAssessment", "Đánh giá nguy cơ té ngã", check.fallRiskAssessment)}
            ${checkBool("vteRiskAssessment", "Đánh giá nguy cơ viêm tĩnh mạch", check.vteRiskAssessment)}
            ${checkBool("painAssessment", "Đánh giá đau", check.painAssessment)}
            ${checkBool("pressureUlcerRiskAssessment", "Đánh giá nguy cơ loét tỳ đè", check.pressureUlcerRiskAssessment)}
            ${checkBool("glasgowAssessment", "Đánh giá Glasgow", check.glasgowAssessment)}
          </div>
        </div>

        <div class="assessment-section-card">
          <h3>Thang điểm đánh giá</h3>
          <div class="assessment-form compact-form">
            ${checkBool("fallRiskAssessment", "Đánh giá nguy cơ té ngã", check.fallRiskAssessment)}
            ${checkBool("vteRiskAssessment", "Đánh giá nguy cơ viêm tĩnh mạch", check.vteRiskAssessment)}
            ${checkBool("painAssessment", "Đánh giá đau", check.painAssessment)}
            ${checkBool("pressureUlcerRiskAssessment", "Đánh giá nguy cơ loét tỳ đè", check.pressureUlcerRiskAssessment)}
            ${checkBool("glasgowAssessment", "Đánh giá Glasgow", check.glasgowAssessment)}
          </div>
        </div>

        <div class="disease-checklist">
          <div class="disease-checklist-head">
            <strong>Gợi ý nhận định theo mặt bệnh</strong>
            <button class="btn" data-action="add-assessment">Thêm mục khác</button>
          </div>
          <div class="compact-check-grid">
            ${
              assessments.length
                ? assessments.map((item) => `
                  <label class="compact-check">
                    <input type="checkbox" ${state.selectedAssessments.has(item.id) ? "checked" : ""} data-assessment="${h(item.id)}" />
                    <span>${h(item.prompt)}</span>
                  </label>
                `).join("")
                : `<div class="empty">Chưa có gợi ý nhận định cho mặt bệnh này.</div>`
            }
            ${[...state.selectedAssessments]
              .filter((id) => id.startsWith("custom-assessment-"))
              .map((id) => `
                <label class="compact-check custom-line">
                  <input type="checkbox" checked data-assessment="${h(id)}" />
                  <input value="${h(state.assessmentEdits[id] || "")}" placeholder="Nhập nhận định khác..." data-assessment-edit="${h(id)}" />
                </label>
              `).join("")}
          </div>
        </div>
      </div>
    </section>
  `;
  return `
    <section class="panel assessment-checklist-panel">
      <div class="panel-header">
        <div>
          <h2 class="panel-title">Nhận định điều dưỡng</h2>
          <p class="panel-subtitle">Ghi nhận theo checklist, chọn nhanh các mục phù hợp và bổ sung nhận định theo mặt bệnh.</p>
        </div>
        <span class="step-badge">2</span>
      </div>
      <div class="panel-body">
        <div class="assessment-form">
          <div class="assessment-full patient-summary">
            <strong>Thông tin hành chính của người bệnh</strong>
            <span>Họ tên: ${h((patients[state.selectedPatientIndex] || patients[0]).name)} | Mã y tế: ${h((patients[state.selectedPatientIndex] || patients[0]).code)} | Giới tính: ${h((patients[state.selectedPatientIndex] || patients[0]).sex)} | Tuổi: ${(patients[state.selectedPatientIndex] || patients[0]).age}</span>
          </div>

          ${checkField("evalTime", "Thời gian đánh giá", check.evalTime, "datetime-local")}
          ${checkField("evaluator", "Người đánh giá", check.evaluator)}
          ${checkArea("admissionReason", "Lý do nhập viện", check.admissionReason)}
          ${checkArea("note", "Ghi chú", check.note)}
          ${checkArea("abnormal", "Tình trạng bất thường (nếu có)", check.abnormal)}

          ${radioGroup("receiveFrom", "Nhận bệnh từ", ["Phòng khám", "Khoa"], check.receiveFrom)}
          ${radioGroup("transfer", "Phương tiện hỗ trợ di chuyển", ["Có", "Không"], check.transfer)}
          ${radioGroup("general", "Toàn trạng", ["Tốt", "Trung bình", "Xấu"], check.general)}
          ${radioGroup("allergy", "Tiền sử dị ứng", ["Chưa ghi nhận", "Có, loại dị ứng"], check.allergy)}
          ${radioGroup("pain", "Đau", ["Có", "Không"], check.pain)}
          ${radioGroup("digestiveStatus", "Tiêu hóa - Tình trạng", ["Bình thường", "Bụng bằng", "Chướng", "Khác"], check.digestiveStatus)}
          ${radioGroup("bowelSound", "Nhu động ruột", ["Có", "Không"], check.bowelSound)}
          ${radioGroup("otherDigestive", "Khác", ["Trung tiện", "Táo bón", "Tiêu chảy", "Khác"], check.otherDigestive)}
          ${radioGroup("stoma", "HMNT", ["Có", "Không"], check.stoma)}
          ${radioGroup("nutrition", "Dinh dưỡng", ["Nhịn", "Qua miệng", "Ống thông NG", "Ống thông PEG"], check.nutrition)}
          ${radioGroup("diet", "Chế độ", ["Cơm", "Cháo", "Súp"], check.diet)}
          ${checkField("dietOther", "Khác", check.dietOther)}
        </div>

        <div class="disease-checklist">
          <div class="disease-checklist-head">
            <strong>Nhận định theo mặt bệnh</strong>
            <button class="btn" data-action="add-assessment">Thêm mục khác</button>
          </div>
          <div class="compact-check-grid">
            ${
              assessments.length
                ? assessments
                    .map(
                      (item) => `
                      <label class="compact-check">
                        <input type="checkbox" ${state.selectedAssessments.has(item.id) ? "checked" : ""} data-assessment="${h(item.id)}" />
                        <span>${h(item.prompt)}</span>
                      </label>
                    `,
                    )
                    .join("")
                : `<div class="empty">Chưa có checklist gợi ý cho mặt bệnh này.</div>`
            }
            ${[...state.selectedAssessments]
              .filter((id) => id.startsWith("custom-assessment-"))
              .map(
                (id) => `
                <label class="compact-check custom-line">
                  <input type="checkbox" checked data-assessment="${h(id)}" />
                  <input value="${h(state.assessmentEdits[id] || "")}" placeholder="Nhập nhận định khác..." data-assessment-edit="${h(id)}" />
                </label>
              `,
              )
              .join("")}
          </div>
        </div>
      </div>
    </section>
  `;
}

function checkField(key, label, value, type = "text") {
  return `
    <label class="assessment-field">
      <span>${h(label)}</span>
      <input type="${type}" value="${h(value)}" data-checklist="${key}" />
    </label>
  `;
}

function checkArea(key, label, value) {
  return `
    <label class="assessment-field assessment-full">
      <span>${h(label)}</span>
      <textarea data-checklist="${key}">${h(value)}</textarea>
    </label>
  `;
}

function renderRespiratoryDetails(check) {
  if (check.breathingMode === "Thở oxy") {
    return checkField("oxygenFlow", "Lưu lượng oxy (L/phút)", check.oxygenFlow);
  }
  if (check.breathingMode === "HFNC") {
    return `
      ${checkField("oxygenFlow", "Lưu lượng HFNC (L/phút)", check.oxygenFlow)}
      ${checkField("fio2", "FiO2", check.fio2)}
    `;
  }
  if (check.breathingMode === "NIV" || check.breathingMode === "Thở máy") {
    return `
      ${checkField("ventilatorMode", "Mode", check.ventilatorMode)}
      ${checkField("fio2", "FiO2", check.fio2)}
      ${checkField("peep", "PEEP", check.peep)}
      ${checkField("vt", "VT", check.vt)}
    `;
  }
  return "";
}

function renderVasopressorDetails(check) {
  if (!check.circulationVasopressor) return "";
  return `
    <div class="handover-grid">
      ${checkBool("vasopressorNoradrenaline", "Noradrenaline", check.vasopressorNoradrenaline)}
      ${checkBool("vasopressorAdrenaline", "Adrenaline", check.vasopressorAdrenaline)}
      ${checkBool("vasopressorDobutamine", "Dobutamine", check.vasopressorDobutamine)}
      ${checkBool("vasopressorVasopressin", "Vasopressin", check.vasopressorVasopressin)}
    </div>
    ${checkField("vasopressorOther", "Vận mạch khác", check.vasopressorOther)}
  `;
}

function radioGroup(key, label, options, value) {
  return `
    <fieldset class="assessment-radio">
      <legend>${h(label)}</legend>
      <div>
        ${options
          .map(
            (option) => `
            <label>
              <input type="radio" name="${h(key)}" value="${h(option)}" ${value === option ? "checked" : ""} data-checklist-radio="${h(key)}" />
              <span>${h(option)}</span>
            </label>
          `,
          )
          .join("")}
      </div>
    </fieldset>
  `;
}

function multiCheckGroup(key, label, options, value = []) {
  const selected = Array.isArray(value) ? value : value ? [value] : [];
  return `
    <fieldset class="assessment-radio">
      <legend>${h(label)}</legend>
      <div>
        ${options
          .map(
            (option) => `
            <label>
              <input type="checkbox" value="${h(option)}" ${selected.includes(option) ? "checked" : ""} data-checklist-multi="${h(key)}" />
              <span>${h(option)}</span>
            </label>
          `,
          )
          .join("")}
      </div>
    </fieldset>
  `;
}

function checkBool(key, label, value) {
  return `
    <label class="handover-check">
      <input type="checkbox" ${value ? "checked" : ""} data-checklist-bool="${h(key)}" />
      <span>${h(label)}</span>
    </label>
  `;
}

function renderDiagnosisPanel() {
  return `
    <section class="panel">
      <div class="panel-header">
        <div>
          <h2 class="panel-title">Chẩn đoán điều dưỡng & mục tiêu</h2>
          <p class="panel-subtitle">Gợi ý tự nạp theo mặt bệnh; có thể chọn, sửa hoặc thêm mới.</p>
        </div>
        <span class="step-badge">3</span>
      </div>
      <div class="panel-body">
        <div class="diagnosis-grid">
          ${state.diagnosisRows
            .map(
              (row, index) => `
              <div class="diagnosis-item">
                <input type="checkbox" ${row.selected ? "checked" : ""} data-dx-selected="${index}" />
                <div class="two-col">
                  <div class="field">
                    <label>Chẩn đoán</label>
                    <textarea data-dx-field="${index}:diagnosis">${h(row.diagnosis)}</textarea>
                  </div>
                  <div class="field">
                    <label>Mục tiêu</label>
                    <textarea data-dx-field="${index}:goal">${h(row.goal)}</textarea>
                  </div>
                </div>
                <button class="remove-row-btn" data-action="remove-diagnosis" data-index="${index}" aria-label="Xóa gợi ý">Xóa</button>
              </div>
            `,
            )
            .join("")}
        </div>
        <button class="btn" style="margin-top: 12px;" data-action="add-diagnosis">Thêm dòng chẩn đoán</button>
      </div>
    </section>
  `;
}

function renderInterventionPanel() {
  return `
    <section class="panel">
      <div class="panel-header">
        <div>
          <h2 class="panel-title">Can thiệp chăm sóc</h2>
          <p class="panel-subtitle">Kèm mã can thiệp gợi ý, cho phép sửa nội dung và thêm can thiệp.</p>
        </div>
        <span class="step-badge">4</span>
      </div>
      <div class="panel-body">
        <div class="intervention-grid">
          ${state.interventionRows
            .map(
              (row, index) => `
              <div class="intervention-item">
                <input type="checkbox" ${row.selected ? "checked" : ""} data-iv-selected="${index}" />
                <div>
                  <span class="code-pill">${h(row.code)}</span>
                  <div class="two-col">
                    <div class="field">
                      <label>Mã can thiệp</label>
                      <input value="${h(row.code)}" data-iv-field="${index}:code" />
                    </div>
                    <div class="field">
                      <label>Nội dung can thiệp</label>
                    <textarea data-iv-field="${index}:content">${h(row.content)}</textarea>
                    </div>
                  </div>
                </div>
                <button class="remove-row-btn" data-action="remove-intervention" data-index="${index}" aria-label="Xóa gợi ý">Xóa</button>
              </div>
            `,
            )
            .join("")}
        </div>
        <button class="btn" style="margin-top: 12px;" data-action="add-intervention">Thêm can thiệp tùy chọn</button>
      </div>
    </section>
  `;
}

function renderHandoverPanel() {
  const check = state.assessmentChecklist;
  return `
    <section class="panel handover-panel">
      <div class="panel-header">
        <div>
          <h2 class="panel-title">Bàn giao</h2>
          <p class="panel-subtitle">Các việc cần tiếp tục theo dõi hoặc thực hiện.</p>
        </div>
      </div>
      <div class="panel-body">
        <div class="handover-grid">
          ${checkBool("handoverMedicineHalf", "Thuốc còn 1/2", check.handoverMedicineHalf)}
          ${checkBool("handoverLab", "Lấy xét nghiệm", check.handoverLab)}
          ${checkBool("handoverFilm", "Lấy phim", check.handoverFilm)}
          ${checkBool("handoverWaitLab", "Chờ kết quả xét nghiệm", check.handoverWaitLab)}
          ${checkBool("handoverWaitFilm", "Chờ phim", check.handoverWaitFilm)}
          ${checkBool("handoverDressing", "Thay băng", check.handoverDressing)}
          ${checkBool("handoverDrain", "Theo dõi dẫn lưu", check.handoverDrain)}
          ${checkBool("handoverVitals", "Theo dõi DHST", check.handoverVitals)}
          ${checkBool("handoverUrine", "Theo dõi nước tiểu", check.handoverUrine)}
          ${checkBool("handoverTube", "Chăm sóc sonde", check.handoverTube)}
        </div>
        ${checkArea("handoverOther", "Khác", check.handoverOther)}
      </div>
    </section>
  `;
}

function renderSheet(condition) {
  const assessmentIds = assessmentSections(condition);
  const checklistItems = assessmentChecklistSummary();
  const assessments = assessmentIds
    .filter((item) => state.selectedAssessments.has(item.id))
    .map((item) => state.assessmentEdits[item.id] ?? item.result)
    .filter(Boolean);
  [...state.selectedAssessments]
    .filter((id) => id.startsWith("custom-assessment-"))
    .forEach((id) => {
      if (state.assessmentEdits[id]) assessments.push(state.assessmentEdits[id]);
    });
  const diagnoses = state.diagnosisRows.filter((row) => row.selected && (row.diagnosis || row.goal));
  const interventions = state.interventionRows.filter((row) => row.selected && row.content);
  
  // Build comprehensive assessment sections for sheet
  const assessmentSections = buildAssessmentSectionsForSheet();
  
  return `
    <section class="panel printable-panel">
      <div class="panel-header no-print">
        <div>
          <h2 class="panel-title">Bản phiếu hoàn chỉnh</h2>
          <p class="panel-subtitle">Nội dung này dùng để in hoặc lưu PDF từ trình duyệt.</p>
        </div>
      </div>
      <div class="panel-body">
        <article class="sheet">
          <header class="sheet-head">
            <div>
              <h2>Phiếu chăm sóc điều dưỡng cấp ${h(state.careLevel)}</h2>
              <div class="sheet-meta">
                <span>Người bệnh: ${h((patients[state.selectedPatientIndex] || patients[0]).name)}</span>
                <span>Tuổi: ${h((patients[state.selectedPatientIndex] || patients[0]).age)}</span>
                <span>Ngày: ${h(state.assessmentChecklist.evalTime.split('T')[0])}</span>
                <span>Phòng: ${h((patients[state.selectedPatientIndex] || patients[0]).room)}</span>
                <span>Giường: ${h((patients[state.selectedPatientIndex] || patients[0]).bed || ".....")}</span>
                <span>Chẩn đoán y khoa: ${h((patients[state.selectedPatientIndex] || patients[0]).name)}</span>
              </div>
            </div>
            <strong>${h(currentCategory().ten_nhom)} / ${h(currentDepartment().ten_khoa)}</strong>
          </header>
          ${sheetList("I. Nhận định điều dưỡng", [...checklistItems, ...assessmentSections, ...assessments])}
          ${sheetDiagnosis(diagnoses)}
          ${sheetInterventions(interventions)}
        </article>
      </div>
    </section>
  `;
}

function assessmentChecklistSummary() {
  const labels = {
    evalTime: "Thời gian đánh giá",
    evaluator: "Người đánh giá",
    pulse: "Mạch",
    temperature: "Nhiệt độ",
    bloodPressure: "Huyết áp",
    weight: "Cân nặng",
    height: "Chiều cao",
    bmi: "BMI",
    bodyType: "Thể trạng",
    consciousness: "Ý thức",
    mucosa: "Da niêm mạc",
    edema: "Phù",
    breathingMode: "Hô hấp",
    oxygenFlow: "Lưu lượng oxy",
    ventilatorMode: "Mode thở máy",
    fio2: "FiO2",
    peep: "PEEP",
    vt: "VT",
    respiratoryRate: "Nhịp thở",
    spo2: "SpO2",
    vasopressorOther: "Vận mạch khác",
    abdomen: "Bụng",
    stool: "Đại tiện",
    urinary: "Tiểu tiện",
    urineAmount: "Số lượng nước tiểu",
    nutritionType: "Dinh dưỡng",
    menu: "Thực đơn",
    circulationNote: "Tuần hoàn",
    respiratoryNote: "Ghi chú hô hấp",
    diseasedOrgan: "Cơ quan bệnh",
    handoverOther: "Bàn giao khác",
  };
  const booleanLabels = {
    handoverMedicineHalf: "Bàn giao: Thuốc còn 1/2",
    handoverLab: "Bàn giao: Lấy xét nghiệm",
    handoverFilm: "Bàn giao: Lấy phim",
    handoverWaitLab: "Bàn giao: Chờ kết quả xét nghiệm",
    handoverWaitFilm: "Bàn giao: Chờ phim",
    handoverDressing: "Bàn giao: Thay băng",
    handoverDrain: "Bàn giao: Theo dõi dẫn lưu",
    handoverVitals: "Bàn giao: Theo dõi DHST",
    handoverUrine: "Bàn giao: Theo dõi nước tiểu",
    handoverTube: "Bàn giao: Chăm sóc sonde",
    circulationStable: "Tuần hoàn: Ổn định",
    circulationFastPulse: "Tuần hoàn: Mạch nhanh",
    circulationHypotension: "Tuần hoàn: Hạ huyết áp",
    circulationShock: "Tuần hoàn: Sốc",
    circulationVasopressor: "Tuần hoàn: Có thuốc vận mạch",
    vasopressorNoradrenaline: "Vận mạch: Noradrenaline",
    vasopressorAdrenaline: "Vận mạch: Adrenaline",
    vasopressorDobutamine: "Vận mạch: Dobutamine",
    vasopressorVasopressin: "Vận mạch: Vasopressin",
  };
  return Object.entries(state.assessmentChecklist)
    .filter(([, value]) =>
      typeof value === "boolean" ? value : Array.isArray(value) ? value.length : cleanLine(value),
    )
    .map(([key, value]) => {
      if (typeof value === "boolean") return booleanLabels[key];
      if (Array.isArray(value)) return `${labels[key] || key}: ${value.join(", ")}`;
      return `${labels[key] || key}: ${value}`;
    });
}

function buildAssessmentSectionsForSheet() {
  const check = state.assessmentChecklist;
  const sections = [];
  
  const sectionGroups = {
    "A. Dấu hiệu sinh tồn": ["pulse", "temperature", "bloodPressure", "respiratoryRate", "spo2", "weight", "height", "bmi"],
    "B. Toàn thân": ["bodyType", "consciousness", "mucosa", "edema"],
    "C. Hô hấp": ["breathingMode", "oxygenFlow", "ventilatorMode", "fio2", "peep", "vt", "respiratoryNote"],
    "D. Tuần hoàn": ["circulationStable", "circulationFastPulse", "circulationHypotension", "circulationShock", "circulationVasopressor", "vasopressorNoradrenaline", "vasopressorAdrenaline", "vasopressorDobutamine", "vasopressorVasopressin", "vasopressorOther", "circulationNote"],
    "E. Tiêu hóa": ["abdomen", "stool"],
    "F. Tiết niệu": ["urinary", "urineAmount"],
    "G. Dinh dưỡng": ["nutritionType", "menu"],
    "H. Bàn giao": ["handoverMedicineHalf", "handoverLab", "handoverWaitLab", "handoverFilm", "handoverWaitFilm", "handoverDressing", "handoverDrain", "handoverVitals", "handoverUrine", "handoverTube", "handoverOther"],
    "I. Khác": ["diseasedOrgan"],
    "J. Thang điểm đánh giá": ["fallRiskAssessment", "vteRiskAssessment", "painAssessment", "pressureUlcerRiskAssessment", "glasgowAssessment"]
  };
  
  const labels = {
    pulse: "Mạch", temperature: "Nhiệt độ", bloodPressure: "Huyết áp", weight: "Cân nặng", height: "Chiều cao", bmi: "BMI",
    bodyType: "Thể trạng", consciousness: "Ý thức", mucosa: "Da niêm mạc", edema: "Phù",
    breathingMode: "Hô hấp", oxygenFlow: "Lưu lượng oxy", ventilatorMode: "Mode thở máy", fio2: "FiO2", peep: "PEEP", vt: "VT", respiratoryNote: "Ghi chú",
    circulationStable: "Ổn định", circulationFastPulse: "Mạch nhanh", circulationHypotension: "Hạ huyết áp", circulationShock: "Sốc", circulationVasopressor: "Có vận mạch", vasopressorNoradrenaline: "Noradrenaline", vasopressorAdrenaline: "Adrenaline", vasopressorDobutamine: "Dobutamine", vasopressorVasopressin: "Vasopressin", vasopressorOther: "Khác", circulationNote: "Ghi chú",
    abdomen: "Bụng", stool: "Đại tiện",
    urinary: "Tiểu tiện", urineAmount: "Số lượng",
    nutritionType: "Loại", menu: "Thực đơn",
    handoverMedicineHalf: "Thuốc còn 1/2", handoverLab: "Lấy xét nghiệm", handoverWaitLab: "Chờ xét nghiệm", handoverFilm: "Lấy phim", handoverWaitFilm: "Chờ phim", handoverDressing: "Thay băng", handoverDrain: "Theo dõi dẫn lưu", handoverVitals: "Theo dõi DHST", handoverUrine: "Theo dõi nước tiểu", handoverTube: "Chăm sóc sonde", handoverOther: "Khác",
    diseasedOrgan: "Cơ quan bị bệnh",
    fallRiskAssessment: "Đánh giá nguy cơ té ngã",
    vteRiskAssessment: "Đánh giá nguy cơ viêm tĩnh mạch",
    painAssessment: "Đánh giá đau",
    pressureUlcerRiskAssessment: "Đánh giá nguy cơ loét tỳ đè",
    glasgowAssessment: "Đánh giá Glasgow"
  };
  
  for (const [section, fields] of Object.entries(sectionGroups)) {
    const items = [];
    for (const field of fields) {
      const value = check[field];
      if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0) || (typeof value === "boolean" && !value)) continue;
      
      if (typeof value === "boolean") {
        items.push(`${labels[field] || field}: Có`);
      } else if (Array.isArray(value)) {
        items.push(`${labels[field] || field}: ${value.join(", ")}`);
      } else if (typeof value === "string" && value.trim()) {
        items.push(`${labels[field] || field}: ${value}`);
      }
    }
    if (items.length > 0) {
      sections.push(`${section}: ${items.join("; ")}`);
    }
  }
  
  return sections;
}

function oldAssessmentChecklistSummary() {
  const labels = {
    evalTime: "Thời gian đánh giá",
    evaluator: "Người đánh giá",
    admissionReason: "Lý do nhập viện",
    note: "Ghi chú",
    abnormal: "Tình trạng bất thường",
    receiveFrom: "Nhận bệnh từ",
    transfer: "Phương tiện hỗ trợ di chuyển",
    general: "Toàn trạng",
    allergy: "Tiền sử dị ứng",
    pain: "Đau",
    digestiveStatus: "Tiêu hóa",
    bowelSound: "Nhu động ruột",
    otherDigestive: "Khác",
    stoma: "HMNT",
    nutrition: "Dinh dưỡng",
    diet: "Chế độ",
    dietOther: "Chế độ khác",
  };
  return Object.entries(state.assessmentChecklist)
    .filter(([, value]) => cleanLine(value))
    .map(([key, value]) => `${labels[key] || key}: ${value}`);
}

function sheetList(title, items) {
  return `
    <section class="sheet-section">
      <h3>${h(title)}</h3>
      ${
        items.length
          ? `<ol>${items.map((item) => `<li>${h(item).replace(/\n/g, "<br />")}</li>`).join("")}</ol>`
          : `<div class="empty">Chưa chọn nội dung.</div>`
      }
    </section>
  `;
}

function sheetDiagnosis(items) {
  return `
    <section class="sheet-section">
      <h3>II. Chẩn đoán điều dưỡng & mục tiêu</h3>
      ${
        items.length
          ? `<ol>${items
              .map(
                (item) => `
                <li>
                  <strong>${h(item.diagnosis)}</strong>
                  ${item.goal ? `<br />Mục tiêu: ${h(item.goal)}` : ""}
                </li>
              `,
              )
              .join("")}</ol>`
          : `<div class="empty">Chưa chọn chẩn đoán.</div>`
      }
    </section>
  `;
}

function sheetInterventions(items) {
  return `
    <section class="sheet-section">
      <h3>III. Can thiệp chăm sóc</h3>
      ${
        items.length
          ? `<ol>${items.map((item) => `<li><strong>${h(item.code)}</strong> - ${h(item.content)}</li>`).join("")}</ol>`
          : `<div class="empty">Chưa chọn can thiệp.</div>`
      }
    </section>
  `;
}

app.addEventListener("click", (event) => {
  const target = event.target.closest("button");
  if (!target) return;

  if (target.dataset.patientIndex) {
    state.selectedPatientIndex = Number(target.dataset.patientIndex);
    state.screen = "record";
    render();
    return;
  }

  if (target.dataset.screen) {
    state.screen = target.dataset.screen;
    render();
    return;
  }

  if (target.dataset.action === "record-menu") {
    state.screen = "recordMenu";
    render();
    return;
  }

  if (target.dataset.action === "create-care") {
    state.hasCareSheet = true;
    state.screen = "careForm";
    render();
    return;
  }

  if (target.dataset.category) {
    state.categoryId = target.dataset.category;
    state.departmentId = currentCategory().khoa[0].id;
    state.conditionId = currentDepartment().mat_benh[0].id;
    state.search = "";
    resetForCondition();
    return;
  }

  if (target.dataset.department) {
    state.departmentId = target.dataset.department;
    state.conditionId = currentDepartment().mat_benh[0].id;
    state.search = "";
    resetForCondition();
    return;
  }

  if (target.dataset.condition) {
    if (target.dataset.categoryRef) state.categoryId = target.dataset.categoryRef;
    if (target.dataset.departmentRef) state.departmentId = target.dataset.departmentRef;
    state.conditionId = target.dataset.condition;
    resetForCondition();
    return;
  }

  if (target.dataset.level) {
    state.careLevel = target.dataset.level;
    render();
    return;
  }

  if (target.dataset.removeAssessment) {
    state.selectedAssessments.delete(target.dataset.removeAssessment);
    render();
    return;
  }

  if (target.dataset.action === "add-assessment") {
    const id = `custom-assessment-${Date.now()}`;
    state.selectedAssessments.add(id);
    state.assessmentEdits[id] = "";
    render();
    return;
  }

  if (target.dataset.action === "add-diagnosis") {
    state.diagnosisRows.push({ id: `dx-${Date.now()}`, selected: true, diagnosis: "", goal: "" });
    render();
    return;
  }

  if (target.dataset.action === "remove-diagnosis") {
    state.diagnosisRows.splice(Number(target.dataset.index), 1);
    render();
    return;
  }

  if (target.dataset.action === "add-intervention") {
    state.interventionRows.push({ id: `iv-${Date.now()}`, selected: true, code: "CS-T999", content: "" });
    render();
    return;
  }

  if (target.dataset.action === "remove-intervention") {
    state.interventionRows.splice(Number(target.dataset.index), 1);
    render();
    return;
  }

  if (target.dataset.action === "clear") {
    state.selectedAssessments = new Set();
    state.assessmentEdits = {};
    state.patient = { ...state.patient, name: "", code: "", age: "", sex: "", room: "", bed: "", department: "", diagnosis: "" };
    resetForCondition();
    return;
  }

  if (target.dataset.action === "print") {
    window.print();
  }
});

app.addEventListener("input", (event) => {
  const target = event.target;
  if (target.dataset.input === "search") {
    state.search = target.value;
    render('[data-input="search"]');
    return;
  }

  if (target.dataset.patient) {
    state.patient[target.dataset.patient] = target.value;
    return;
  }

  if (target.dataset.assessmentEdit) {
    state.assessmentEdits[target.dataset.assessmentEdit] = target.value;
    return;
  }

  if (target.dataset.checklist) {
    state.assessmentChecklist[target.dataset.checklist] = target.value;
    if (target.dataset.checklist === "weight" || target.dataset.checklist === "height") {
      const weight = Number(state.assessmentChecklist.weight);
      const height = Number(state.assessmentChecklist.height);
      state.assessmentChecklist.bmi = weight > 0 && height > 0 ? (weight / (height / 100) ** 2).toFixed(1) : "";
    }
    return;
  }

  if (target.dataset.dxField) {
    const [index, key] = target.dataset.dxField.split(":");
    state.diagnosisRows[Number(index)][key] = target.value;
    return;
  }

  if (target.dataset.ivField) {
    const [index, key] = target.dataset.ivField.split(":");
    state.interventionRows[Number(index)][key] = target.value;
  }
});

app.addEventListener("change", (event) => {
  const target = event.target;
  if (target.dataset.categorySelect !== undefined) {
    state.categoryId = target.value;
    state.departmentId = currentCategory().khoa[0].id;
    state.conditionId = currentDepartment().mat_benh[0].id;
    state.search = "";
    resetForCondition();
    return;
  }

  if (target.dataset.departmentSelect !== undefined) {
    state.departmentId = target.value;
    state.conditionId = currentDepartment().mat_benh[0].id;
    state.search = "";
    resetForCondition();
    return;
  }

  if (target.dataset.checklistBool) {
    state.assessmentChecklist[target.dataset.checklistBool] = target.checked;
    render();
    return;
  }

  if (target.dataset.checklistMulti) {
    const key = target.dataset.checklistMulti;
    const values = Array.isArray(state.assessmentChecklist[key]) ? [...state.assessmentChecklist[key]] : [];
    if (target.checked && !values.includes(target.value)) values.push(target.value);
    if (!target.checked) {
      const index = values.indexOf(target.value);
      if (index >= 0) values.splice(index, 1);
    }
    state.assessmentChecklist[key] = values;
    render();
    return;
  }

  if (target.dataset.assessment) {
    if (target.checked) {
      state.selectedAssessments.add(target.dataset.assessment);
      const item = assessmentSections(currentCondition()).find((entry) => entry.id === target.dataset.assessment);
      if (item && state.assessmentEdits[target.dataset.assessment] === undefined) {
        state.assessmentEdits[target.dataset.assessment] = item.result;
      }
    } else {
      state.selectedAssessments.delete(target.dataset.assessment);
    }
    render();
    return;
  }

  if (target.dataset.dxSelected) {
    state.diagnosisRows[Number(target.dataset.dxSelected)].selected = target.checked;
    render();
    return;
  }

  if (target.dataset.ivSelected) {
    state.interventionRows[Number(target.dataset.ivSelected)].selected = target.checked;
    render();
    return;
  }

  if (target.dataset.checklistRadio) {
    state.assessmentChecklist[target.dataset.checklistRadio] = target.value;
    render();
    return;
  }

  if (
    target.dataset.patient ||
    target.dataset.assessmentEdit ||
    target.dataset.checklist ||
    target.dataset.dxField ||
    target.dataset.ivField
  ) {
    render();
  }
});

async function init() {
  try {
    const response = await fetch("./cd_deu_duong.json");
    if (!response.ok) throw new Error(`Khong tai duoc cd_deu_duong.json (${response.status})`);
    state.raw = await response.json();
    state.data = deepFix(state.raw);
    state.categoryId = state.data.categories[0].id;
    state.departmentId = state.data.categories[0].khoa[0].id;
    state.conditionId = state.data.categories[0].khoa[0].mat_benh[0].id;
    const params = new URLSearchParams(window.location.search);
    if (params.get("screen")) state.screen = params.get("screen");
    if (params.get("hasCareSheet") === "1") state.hasCareSheet = true;
    if (params.get("patient")) {
      const index = patients.findIndex((patient) => patient.code === params.get("patient"));
      if (index >= 0) state.selectedPatientIndex = index;
    }
    resetForCondition();
  } catch (error) {
    app.innerHTML = `
      <div class="error">
        <strong>Không mở được dữ liệu.</strong>
        <p>${h(error.message)}</p>
        <p>Hãy chạy app qua local server trong thư mục này, ví dụ: <code>python -m http.server 5173</code>.</p>
      </div>
    `;
  }
}

init();
