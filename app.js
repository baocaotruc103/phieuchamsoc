const app = document.querySelector("#app");
let supabaseClient = null;
const VIETNAM_TIME_ZONE = "Asia/Ho_Chi_Minh";

function vietnamDateParts(date = new Date()) {
  return Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: VIETNAM_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      hourCycle: "h23",
    })
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
}

function currentVietnamDateInput() {
  const parts = vietnamDateParts();
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function currentVietnamDateTimeInput(includeSeconds = false) {
  const parts = vietnamDateParts();
  const value = `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
  return includeSeconds ? `${value}:${parts.second}` : value;
}

function parseDateTimeForVietnam(value) {
  if (!value) return null;
  const text = String(value);
  const hasTimeZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(text);
  const normalized = hasTimeZone ? text : `${text.replace(" ", "T")}+07:00`;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

const state = {
  raw: null,
  data: null,
  screen: "patients",
  hasCareSheet: false,
  careSheets: [],
  careSheetsLoadedFor: "",
  careSheetsLoading: false,
  careSheetsError: "",
  selectedCareSheetId: null,
  editingCareSheetId: null,
  careGoalEvaluations: [],
  careGoalEvaluationsLoadedFor: "",
  careGoalEvaluationsLoading: false,
  careGoalEvaluationsError: "",
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
    date: currentVietnamDateInput(),
  },
  selectedAssessments: new Set(),
  assessmentEdits: {},
  assessmentChecklist: {
    evalTime: currentVietnamDateTimeInput(),
    evaluator: "2272 | Nguyễn Văn Thiện",
    pulse: "",
    temperature: "",
    bloodPressure: "",
    weight: "",
    height: "",
    bmi: "",
    allergy: "none",
    allergy_note: "",
    fluidIn: "",
    fluidOut: "",
    fluidBalance: "",
    bodyType: "",
    consciousness: "",
    mucosa: "",
    edema: "",
    systemicNote: "",
    breathingMode: "",
    ventilationAirway: [],
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
    menu: [],
    neuroConsciousness: [],
    neuroOrientation: [],
    neuroBehavior: [],
    neuroFocalSigns: [],
    neuroSensory: "",
    mobilityAbility: [],
    muscleStrength: [],
    movementStatus: [],
    mobilityRehab: "",
    treatmentEducation: [],
    careEducation: [],
    preventionEducation: [],
    healthEducation: "",
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
  assessmentTemplate: null,
  scaleData: [],
  scaleScores: {},
  scaleResults: {},
  activeScale: null,
  activeDiagnosisSuggest: null,
  activeGoalSuggest: null,
  interventionCatalog: [],
  activeInterventionSuggest: null,
};

const initialAssessmentChecklist = JSON.parse(JSON.stringify(state.assessmentChecklist));

function createDefaultAssessmentChecklist() {
  return {
    ...JSON.parse(JSON.stringify(initialAssessmentChecklist)),
    evalTime: currentVietnamDateTimeInput(),
  };
}

const scaleMapping = {
  fallRiskAssessment: "morse_fall_scale",
  vteRiskAssessment: "vip_score",
  painAssessment: "flacc_pain_scale",
  current_pain: "flacc_pain_scale",
  glasgow_score: "glasgow_coma_scale",
  fall_risk_score: "morse_fall_scale",
  vip_score_point: "vip_score",
  braden_score: "lawrence_braden_scale",
  pressureUlcerRiskAssessment: "lawrence_braden_scale",
  glasgowAssessment: "glasgow_coma_scale",
};

const scaleResultFields = {
  vip_score_point: "vip_score_conclusion",
  braden_score: "braden_conclusion",
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

function supabaseConfig() {
  return window.SUPABASE_CONFIG || {};
}

function isSupabaseConfigured() {
  const config = supabaseConfig();
  return Boolean(
    window.supabase &&
      config.url &&
      config.anonKey &&
      !config.url.includes("YOUR_PROJECT_ID") &&
      !config.anonKey.includes("YOUR_SUPABASE_ANON_KEY"),
  );
}

function getSupabaseClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Chưa cấu hình Supabase URL/anon key trong supabase-config.js");
  }
  if (!supabaseClient) {
    const config = supabaseConfig();
    supabaseClient = window.supabase.createClient(config.url, config.anonKey);
  }
  return supabaseClient;
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

function normalizeVietnameseText(text) {
  return String(text ?? "")
    .replaceAll("C�ch ng�y", "Cách ngày")
    .replaceAll("Kh�c", "Khác")
    .replaceAll("Th�nh gi�c", "Thính giác")
    .replaceAll("Tr�nh thai", "Trành thai")
    .replaceAll("Tránh thai", "Trành thai");
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

function createDiagnosisRow() {
  return {
    id: `dx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    selected: true,
    diagnosis: "",
    diagnosisQuery: "",
    goalQuery: "",
    goals: [],
  };
}

function diagnosisSuggestionsForSearch(condition) {
  const sections = condition.sections || {};
  const items = diagnosisKeys.flatMap((key) => normalizeItems(sections[key]));
  const lines = items.flatMap((item) => splitBullets([item.noi_dung, item.ket_qua].filter(Boolean).join("\n")));
  const rows = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const next = lines[index + 1] || "";
    if (isGoalLine(line)) continue;
    rows.push({
      diagnosis: stripDiagnosisPrefix(line),
      goal: isGoalLine(next) ? stripGoalPrefix(next) : "",
    });
  }
  return rows;
}

function diagnosisSuggestionBank() {
  const grouped = new Map();
  for (const item of diagnosisSuggestionsForSearch(currentCondition())) {
    const diagnosis = cleanLine(item.diagnosis);
    const goal = cleanLine(item.goal);
    if (!diagnosis) continue;
    if (!grouped.has(diagnosis)) grouped.set(diagnosis, { diagnosis, goals: [] });
    if (goal && !grouped.get(diagnosis).goals.includes(goal)) grouped.get(diagnosis).goals.push(goal);
  }
  return [...grouped.values()];
}

function searchKey(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function isGoalLine(text) {
  const key = searchKey(text);
  return key.includes("muc tieu") || key.includes("má»¥c tieu");
}

function stripGoalPrefix(text) {
  return cleanLine(
    String(text || "")
      .replace(/^mục tiêu\s*\d*\s*:\s*/i, "")
      .replace(/^má»¥c tiÃªu\s*\d*\s*:\s*/i, ""),
  );
}

function stripDiagnosisPrefix(text) {
  return cleanLine(
    String(text || "")
      .replace(/^chẩn đoán\s*\d*\s*:\s*/i, "")
      .replace(/^cháº©n Ä‘oÃ¡n\s*\d*\s*:\s*/i, ""),
  );
}

function filteredDiagnosisOptions(row) {
  const query = searchKey(row.diagnosisQuery || row.diagnosis);
  if (!query) return [];
  return diagnosisSuggestionBank()
    .filter((item) => !query || searchKey(item.diagnosis).includes(query))
    .slice(0, 6);
}

function filteredGoalOptions(row, goalValue = "") {
  const query = searchKey(goalValue);
  if (!query) return [];
  const bank = diagnosisSuggestionBank();
  const selected = bank.find((item) => item.diagnosis === row.diagnosis);
  const goals = [...(selected?.goals || []), ...bank.flatMap((item) => item.goals)];
  return [...new Set(goals)]
    .filter((goal) => !query || searchKey(goal).includes(query))
    .slice(0, 6);
}

function interventionCatalogItems() {
  return (state.interventionCatalog || []).flatMap((group) =>
    (group.interventions || []).map((item) => ({
      code: cleanLine(item.code),
      name: cleanLine(item.name),
      group: cleanLine(group.group),
    })),
  );
}

function findInterventionByCode(code) {
  const key = searchKey(code);
  return interventionCatalogItems().find((item) => searchKey(item.code) === key);
}

function findInterventionByName(name) {
  const key = searchKey(name);
  return interventionCatalogItems().find((item) => searchKey(item.name) === key);
}

function filteredInterventionOptions(value, mode) {
  const query = searchKey(value);
  if (!query) return [];
  return interventionCatalogItems()
    .filter((item) => {
      const target = mode === "code" ? item.code : item.name;
      return searchKey(target).includes(query);
    })
    .slice(0, 8);
}

function applyInterventionOption(row, item) {
  if (!row || !item) return;
  row.code = item.code;
  row.content = item.name;
  row.selected = true;
}

function codeForIntervention(text, index) {
  const matched = interventionCatalogItems().find((item) => searchKey(text).includes(searchKey(item.name)));
  if (matched) return matched.code;
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

function resetCareFormState({ resetChecklist = false } = {}) {
  if (resetChecklist) {
    state.careLevel = "1";
    state.assessmentChecklist = createDefaultAssessmentChecklist();
    state.scaleScores = {};
    state.scaleResults = {};
    state.activeScale = null;
  }
  state.selectedAssessments = new Set();
  state.assessmentEdits = {};
  state.diagnosisRows = [createDiagnosisRow()];
  state.interventionRows = [];
  state.activeDiagnosisSuggest = null;
  state.activeGoalSuggest = null;
  state.activeInterventionSuggest = null;
}

function resetForCondition(options = {}) {
  resetCareFormState(options);
  render();
}

function hydrateCareFormFromSheet(sheet) {
  if (!sheet) return;
  const assessment = sheet.nhan_dinh_json || {};
  const checklist = assessment.checklist || {};
  const handover = sheet.ban_giao_json || {};
  const diagnoses = Array.isArray(sheet.chan_doan_muc_tieu_json) ? sheet.chan_doan_muc_tieu_json : [];
  const interventions = Array.isArray(sheet.can_thiep_json) ? sheet.can_thiep_json : [];

  state.editingCareSheetId = sheet.id;
  state.selectedCareSheetId = sheet.id;
  state.careLevel = String(sheet.cap_cham_soc || state.careLevel || "1");
  state.assessmentChecklist = {
    ...createDefaultAssessmentChecklist(),
    ...checklist,
    ...handover,
  };
  state.assessmentChecklist.fluidBalance = calculateFluidBalance(
    state.assessmentChecklist.fluidIn,
    state.assessmentChecklist.fluidOut,
  );
  state.scaleResults = sheet.thang_diem_json || {};
  state.activeScale = null;
  state.selectedAssessments = new Set();
  state.assessmentEdits = {};
  state.activeDiagnosisSuggest = null;
  state.activeGoalSuggest = null;
  state.activeInterventionSuggest = null;
  state.diagnosisRows = diagnoses.length
    ? diagnoses.map((item, index) => {
        const goals = Array.isArray(item.goals)
          ? item.goals
          : String(item.goal || "")
              .split("\n")
              .map(cleanLine)
              .filter(Boolean);
        return {
          id: `dx-edit-${sheet.id}-${index}`,
          selected: true,
          diagnosis: item.diagnosis || "",
          diagnosisQuery: item.diagnosis || "",
          goalQuery: "",
          goals,
        };
      })
    : [createDiagnosisRow()];
  state.interventionRows = interventions.map((item, index) => ({
    id: `iv-edit-${sheet.id}-${index}`,
    selected: true,
    code: item.code || "",
    content: item.content || "",
  }));
  state.screen = "careForm";
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
  return normalizeVietnameseText(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function calculateFluidBalance(fluidIn, fluidOut) {
  if (fluidIn === "" || fluidOut === "") return "";
  const inValue = Number(fluidIn);
  const outValue = Number(fluidOut);
  if (!Number.isFinite(inValue) || !Number.isFinite(outValue)) return "";
  return String(inValue - outValue);
}

function updateFluidBalanceField() {
  state.assessmentChecklist.fluidBalance = calculateFluidBalance(
    state.assessmentChecklist.fluidIn,
    state.assessmentChecklist.fluidOut,
  );
  const balanceInput = app.querySelector('[data-checklist="fluidBalance"]');
  if (balanceInput) balanceInput.value = state.assessmentChecklist.fluidBalance;
}

function fluidBalanceFromChecklist(check) {
  const calculated = calculateFluidBalance(check.fluidIn, check.fluidOut);
  return calculated !== "" ? calculated : check.fluidBalance;
}

function inputNextAttrs(type = "text") {
  const inputMode = type === "number" ? ' inputmode="decimal"' : "";
  return `enterkeyhint="next" autocomplete="off" autocapitalize="sentences"${inputMode}`;
}

function focusNextCareInput(current) {
  const fields = [...app.querySelectorAll(`
    .form-mode input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([readonly]):not([disabled]),
    .form-mode textarea:not([readonly]):not([disabled]),
    .form-mode select:not([disabled])
  `)].filter((item) => item.offsetParent !== null);
  const index = fields.indexOf(current);
  const next = fields[index + 1];
  if (!next) return false;
  next.focus({ preventScroll: false });
  if (typeof next.select === "function" && next.tagName !== "TEXTAREA") next.select();
  return true;
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
  const birthYear = Number(vietnamDateParts().year) - patient.age;
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

function renderCareSheetListScreen() {
  const selected = patients[state.selectedPatientIndex] || patients[0];
  const subtitle = `${selected.name} | Mã y tế: ${selected.code} | ${selected.age} tuổi`;
  return `
    <div class="mobile-app care-list-screen">
      ${appBar("Phiếu Chăm Sóc", "patients")}
      <section class="panel care-sheet-list-panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">Danh sách phiếu chăm sóc</h2>
            <p class="panel-subtitle">${h(subtitle)}</p>
          </div>
        </div>
        <div class="panel-body">
          <div class="care-list-actions">
            <button class="btn primary" data-action="create-care">Thêm phiếu chăm sóc</button>
            <button class="btn" data-action="evaluate-results">Đánh giá kết quả</button>
          </div>
          ${renderCareSheetListBody()}
        </div>
      </section>
    </div>
  `;
}

function renderCareSheetListBody() {
  if (state.careSheetsLoading) {
    return `<div class="empty care-list-empty">Đang tải danh sách phiếu chăm sóc...</div>`;
  }
  if (state.careSheetsError) {
    return `<div class="empty care-list-empty">${h(state.careSheetsError)}</div>`;
  }
  if (!state.careSheets.length) {
    return `
      <div class="empty-care compact-empty-care">
        <div class="empty-doc-icon">+</div>
        <h2>Chưa có phiếu chăm sóc</h2>
        <p>Bệnh nhân chưa có phiếu chăm sóc nào. Bấm “Thêm phiếu chăm sóc” để tạo phiếu mới.</p>
      </div>
    `;
  }
  return `
    <div class="care-sheet-list">
      ${state.careSheets.map((sheet) => `
        <article class="care-sheet-row">
          <div>
            <strong>${h(sheet.ma_phieu || `Phiếu #${sheet.id}`)}</strong>
            <span>Cấp chăm sóc: ${h(sheet.cap_cham_soc || "-")}</span>
          </div>
          <div>
            <span>Thời gian đánh giá</span>
            <strong>${h(formatDateTime(sheet.thoi_gian_danh_gia || sheet.created_at))}</strong>
          </div>
          <div>
            <span>Người đánh giá</span>
            <strong>${h(sheet.nguoi_danh_gia || "-")}</strong>
          </div>
          <div class="care-sheet-row-actions">
            <button class="btn" data-action="edit-care-sheet" data-sheet-id="${h(sheet.id)}">Sửa</button>
            <button class="btn" data-action="view-care-sheet" data-sheet-id="${h(sheet.id)}">Xem chi tiết</button>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function renderCareGoalEvaluationScreen() {
  const selected = patients[state.selectedPatientIndex] || patients[0];
  return `
    <div class="mobile-app care-list-screen">
      ${appBar("Đánh giá kết quả", "careEmpty")}
      <section class="panel care-sheet-list-panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">Đánh giá kết quả mục tiêu chăm sóc</h2>
            <p class="panel-subtitle">${h(selected.name)} | Mã y tế: ${h(selected.code)} | ${h(selected.age)} tuổi</p>
          </div>
        </div>
        <div class="panel-body">
          ${renderCareGoalEvaluationBody()}
        </div>
      </section>
    </div>
  `;
}

function renderCareGoalEvaluationBody() {
  if (state.careGoalEvaluationsLoading) {
    return `<div class="empty care-list-empty">Đang tải mục tiêu chăm sóc...</div>`;
  }
  if (state.careGoalEvaluationsError) {
    return `<div class="empty care-list-empty">${h(state.careGoalEvaluationsError)}</div>`;
  }
  if (!state.careGoalEvaluations.length) {
    return `<div class="empty care-list-empty">Chưa có mục tiêu chăm sóc nào của người bệnh này.</div>`;
  }
  return `
    <div class="goal-evaluation-table">
      <div class="goal-evaluation-head">
        <span>Thời gian đặt mục tiêu</span>
        <span>Mục tiêu</span>
        <span>Đánh giá</span>
        <span>Thời gian kết thúc</span>
      </div>
      ${state.careGoalEvaluations.map((item) => `
        <article class="goal-evaluation-row">
          <span>${h(formatDateTime(item.thoi_gian_dat_muc_tieu))}</span>
          <strong>${h(item.muc_tieu)}</strong>
          <div class="goal-evaluation-buttons">
            <button 
              class="btn-eval ${item.danh_gia === "Đạt" ? "active" : ""}" 
              data-action="set-goal-evaluation"
              data-goal-id="${item.id}"
              data-eval-value="Đạt">
              Đạt
            </button>
            <button 
              class="btn-eval ${item.danh_gia === "Không đạt" ? "active" : ""}" 
              data-action="set-goal-evaluation"
              data-goal-id="${item.id}"
              data-eval-value="Không đạt">
              Không đạt
            </button>
          </div>
          <span class="goal-end-time">${item.thoi_gian_ket_thuc_muc_tieu ? h(formatDateTime(item.thoi_gian_ket_thuc_muc_tieu)) : ""}</span>
        </article>
      `).join("")}
    </div>
  `;
}

function formatDateTime(value) {
  if (!value) return "-";
  const date = parseDateTimeForVietnam(value);
  if (!date) return value;
  return date.toLocaleString("vi-VN", { timeZone: VIETNAM_TIME_ZONE });
}

function currentCareSheetDetail() {
  return state.careSheets.find((sheet) => String(sheet.id) === String(state.selectedCareSheetId));
}

function detailField(label, value = "") {
  return `
    <div class="report-field">
      <div>${h(label)}</div>
      <span>${h(value || "................................")}</span>
    </div>
  `;
}

function detailSection(title, content) {
  return `
    <section class="report-section">
      <h2>${h(title)}</h2>
      ${content}
    </section>
  `;
}

function detailCheckGroup(title, items = []) {
  if (!items.length) return "";
  return `
    <div class="report-check-group">
      <strong>${h(title)}</strong>
      <div>
        ${items.map((item) => `
          <span class="report-check checked"><i>✓</i>${h(item)}</span>
        `).join("")}
      </div>
    </div>
  `;
}

function detailTable(rows) {
  return `
    <div class="report-table">
      <table>
        <tbody>
          ${rows.map((row) => `
            <tr>
              <td>${h(row[0])}</td>
              <td>${h(row[1] || "................................").replace(/\n/g, "<br />")}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function detailValueList(items = []) {
  const normalized = items
    .map((item) => {
      const [label, ...rest] = String(item || "").split(":");
      return {
        label: cleanLine(label),
        values: cleanLine(rest.join(":"))
          .split(";")
          .map(cleanLine)
          .filter(Boolean),
      };
    })
    .filter((item) => item.label || item.values.length);
  if (!normalized.length) return `<div class="empty">Chưa có dữ liệu.</div>`;
  return `
    <div class="report-assessment-table">
      ${normalized.map((item) => `
        <div>
          <strong>${h(item.label)}</strong>
          <span>
            ${item.values.length
              ? item.values.map((value) => `<em>${h(value)}</em>`).join("")
              : "<em>Có</em>"}
          </span>
        </div>
      `).join("")}
    </div>
  `;
}

function detailAssessmentItems(sections = []) {
  return sections
    .filter((item) =>
      !/^A\.\s*Thông tin người bệnh/i.test(item) &&
      !/^B\.\s*Theo dõi dịch/i.test(item) &&
      !/^N\.\s*Thang điểm đánh giá/i.test(item) &&
      !/^O\.\s*Bàn giao/i.test(item)
    )
    .map((item, index) => item.replace(/^[A-Z]\.\s*/, `${index + 1}. `));
}

function scaleDetailRows(results = {}) {
  const labels = {
    fallRiskAssessment: "Nguy cơ té ngã",
    vteRiskAssessment: "Nguy cơ viêm tĩnh mạch",
    painAssessment: "Đau",
    pressureUlcerRiskAssessment: "Nguy cơ loét tỳ đè",
    glasgowAssessment: "Glasgow",
    current_pain: "Đau hiện tại",
    glasgow_score: "Glasgow",
    fall_risk_score: "Nguy cơ té ngã",
    pain_score: "Đau",
    vip_score: "Viêm tĩnh mạch",
    braden_score: "Nguy cơ loét tỳ đè",
  };
  return Object.entries(results).map(([key, value]) => {
    if (value && typeof value === "object") {
      const details = [
        value.total !== undefined ? `${value.total} điểm` : "",
        value.risk,
        value.conclusion,
      ].filter(Boolean).join(" - ");
      return [labels[key] || key, details || JSON.stringify(value)];
    }
    return [labels[key] || key, value];
  });
}

function handoverDetailItems(handover = {}) {
  const labels = {
    handoverMedicineHalf: "Thuốc còn 1/2",
    handoverLab: "Lấy xét nghiệm",
    handoverWaitLab: "Chờ kết quả xét nghiệm",
    handoverFilm: "Lấy phim",
    handoverWaitFilm: "Chờ phim",
    handoverDressing: "Thay băng",
    handoverDrain: "Theo dõi dẫn lưu",
    handoverVitals: "Theo dõi DHST",
    handoverUrine: "Theo dõi nước tiểu",
    handoverTube: "Chăm sóc sonde",
    handoverOther: "Khác",
  };
  return Object.entries(handover)
    .filter(([, value]) => value === true || (typeof value === "string" && value.trim()))
    .map(([key, value]) => `${labels[key] || key}: ${value === true ? "Có" : value}`);
}

function renderCareSheetDetailScreen() {
  const sheet = currentCareSheetDetail();
  const selected = patients[state.selectedPatientIndex] || patients[0];
  if (!sheet) {
    return `
      <div class="mobile-app care-detail-screen">
        ${appBar("Chi tiết phiếu chăm sóc", "careEmpty")}
        <section class="panel care-sheet-list-panel">
          <div class="panel-body">
            <div class="empty care-list-empty">Không tìm thấy phiếu chăm sóc.</div>
          </div>
        </section>
      </div>
    `;
  }

  const assessment = sheet.nhan_dinh_json || {};
  const check = assessment.checklist || {};
  const diagnoses = Array.isArray(sheet.chan_doan_muc_tieu_json) ? sheet.chan_doan_muc_tieu_json : [];
  const interventions = Array.isArray(sheet.can_thiep_json) ? sheet.can_thiep_json : [];
  const handover = sheet.ban_giao_json || {};
  const assessmentItems = detailAssessmentItems(assessment.sections || []);
  const scaleRows = scaleDetailRows(sheet.thang_diem_json || {});
  const handoverItems = handoverDetailItems(handover);

  return `
    <div class="mobile-app care-detail-screen">
      ${appBar("Chi tiết phiếu chăm sóc", "careEmpty")}
      <div class="report-actions no-print">
        <button class="btn" data-screen="careEmpty">Quay lại</button>
        <button class="btn" data-action="edit-care-sheet" data-sheet-id="${h(sheet.id)}">Sửa phiếu</button>
        <button class="btn primary" data-action="print">In báo cáo</button>
      </div>
      <main class="report-page">
        <header class="report-head">
          <h1>Phiếu theo dõi và chăm sóc</h1>
          <div>[Phân cấp chăm sóc ${h(sheet.cap_cham_soc || "-")}]</div>
        </header>

        <section class="report-patient-card">
          <div>
            <h2>${h(selected.name)}</h2>
            <p>Mã y tế: <b>${h(selected.code)}</b> | ${h(selected.sex)} | ${h(selected.age)} tuổi</p>
          </div>
        </section>

        ${detailSection("I. Thông tin hành chính", `
          <div class="report-grid cols-3">
            ${detailField("Thời gian đánh giá", formatDateTime(sheet.thoi_gian_danh_gia))}
            ${detailField("Người đánh giá", sheet.nguoi_danh_gia)}
            ${detailField("Phân cấp chăm sóc", `CS cấp ${sheet.cap_cham_soc || "-"}`)}
            ${detailField("Chiều cao (cm)", check.height)}
            ${detailField("Cân nặng (kg)", check.weight)}
            ${detailField("BMI", check.bmi)}
            ${detailField("Dị ứng", check.allergy === "yes" ? `Có: ${check.allergy_note || ""}` : "Không")}
          </div>
        `)}

        ${detailSection("II. Dấu hiệu sinh tồn", `
          <div class="report-grid cols-4">
            ${detailField("Mạch", check.pulse)}
            ${detailField("Nhiệt độ", check.temperature)}
            ${detailField("Huyết áp", check.bloodPressure)}
            ${detailField("SpO2", check.spo2)}
          </div>
        `)}

        ${detailSection("III. Nhận định điều dưỡng", detailValueList(assessmentItems))}

        ${detailSection("VIII. Thang điểm đánh giá", scaleRows.length ? detailTable(scaleRows) : `<div class="empty">Chưa có thang điểm đánh giá.</div>`)}

        ${detailSection("IX. Theo dõi dịch", `
          <div class="report-grid cols-3">
            ${detailField("Dịch vào", check.fluidIn)}
            ${detailField("Dịch ra", check.fluidOut)}
            ${detailField("Bilance", fluidBalanceFromChecklist(check))}
          </div>
        `)}

        ${detailSection("X. Chẩn đoán điều dưỡng - mục tiêu - can thiệp", `
          ${detailTable([
            ["Chẩn đoán điều dưỡng", diagnoses.map((item) => item.diagnosis).filter(Boolean).join("\n")],
            ["Mục tiêu chăm sóc", diagnoses.flatMap((item) => item.goals || []).filter(Boolean).join("\n")],
            ["Mã can thiệp", interventions.map((item) => item.code).filter(Boolean).join("\n")],
            ["Nội dung can thiệp", interventions.map((item) => item.content).filter(Boolean).join("\n")],
          ])}
        `)}

        ${detailSection("XI. Bàn giao", handoverItems.length ? detailCheckGroup("Việc cần tiếp tục theo dõi/thực hiện", handoverItems) : `<div class="empty">Chưa có nội dung bàn giao.</div>`)}

        <footer class="report-signatures">
          <div><strong>Điều dưỡng ghi phiếu</strong><span>Ký, ghi rõ họ tên</span></div>
        </footer>
      </main>
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
    loadCareSheetsForSelectedPatient();
    app.innerHTML = renderCareSheetListScreen();
    return;
  }
  if (state.screen === "careDetail") {
    app.innerHTML = renderCareSheetDetailScreen();
    return;
  }
  if (state.screen === "careEvaluation") {
    loadCareGoalEvaluationsForSelectedPatient();
    app.innerHTML = renderCareGoalEvaluationScreen();
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
        <button class="btn ghost" data-action="save-care">${state.editingCareSheetId ? "Cập nhật phiếu" : "Lưu phiếu và ký"}</button>
        <button class="btn primary" data-action="print">In phiếu</button>
      </div>

      <main class="layout">
        <aside class="rail">
          ${renderPatientPanel()}
        </aside>

        <section class="workspace">
          ${renderAssessmentPanel(assessments)}
          ${renderFluidBalancePanel()}
          ${renderDiagnosisPanel()}
          ${renderInterventionPanel()}
          ${renderHandoverPanel()}
        </section>
      </main>
    </div>
    ${state.activeScale ? renderScaleModal() : ""}
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
        <div class="care-info-grid care-header-grid">
          ${checkField("evalTime", "Thời gian đánh giá", state.assessmentChecklist.evalTime, "datetime-local")}
          ${checkField("evaluator", "Người đánh giá", state.assessmentChecklist.evaluator)}
          ${checkField("height", "Chiều cao (cm)", state.assessmentChecklist.height, "number")}
          ${checkField("weight", "Cân nặng (kg)", state.assessmentChecklist.weight, "number")}
          ${readonlyCheckField("bmi", "BMI (tự động tính)", state.assessmentChecklist.bmi)}
        </div>
        <div class="patient-allergy-block">
          ${radioGroup("allergy", "Dị ứng", ["none", "yes"], state.assessmentChecklist.allergy, [
            { label: "Không", value: "none" },
            { label: "Có", value: "yes" },
          ])}
          ${state.assessmentChecklist.allergy === "yes" ? checkField("allergy_note", "Thông tin dị ứng", state.assessmentChecklist.allergy_note) : ""}
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

function renderFluidBalancePanel() {
  if (state.careLevel !== "1") return "";
  return `
    <section class="panel care-fluid-card">
      <div class="panel-header">
        <div>
          <h2 class="panel-title">Theo dõi dịch</h2>
          <p class="panel-subtitle">Hiển thị khi phân cấp chăm sóc cấp 1.</p>
        </div>
      </div>
      <div class="panel-body">
        <div class="care-info-grid fluid-balance-grid">
          ${checkField("fluidIn", "Dịch vào (ml)", state.assessmentChecklist.fluidIn, "number")}
          ${checkField("fluidOut", "Dịch ra (ml)", state.assessmentChecklist.fluidOut, "number")}
          ${readonlyCheckField("fluidBalance", "Bilance: Dịch vào - dịch ra (ml)", state.assessmentChecklist.fluidBalance)}
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
            ${checkField("spo2", "SpO2 (%)", check.spo2)}
          </div>
        </div>

        <div class="assessment-section-card">
          <h3>Toàn thân <span class="section-hint">(bao gồm da, niêm mạc)</span></h3>
          <div class="assessment-form compact-form">
            ${radioGroup("bodyType", "Thể trạng", ["Gầy", "Trung bình", "Béo"], check.bodyType)}
            ${radioGroup("consciousness", "Ý thức", ["Tỉnh", "Lơ mơ", "Hôn mê", "Kích thích", "An thần"], check.consciousness)}
            ${radioGroup("mucosa", "Da niêm mạc", ["Hồng", "Nhợt"], check.mucosa)}
            ${radioGroup("edema", "Phù", ["Có", "Không"], check.edema)}
            ${checkArea("systemicNote", "Ghi chú toàn thân", check.systemicNote)}
          </div>
        </div>

        <div class="assessment-section-card respiratory-section">
          <h3>Hô hấp</h3>
          <div class="assessment-form compact-form respiratory-form">
            ${radioGroup("breathingMode", "Tình trạng thở", ["Tự thở", "Thở oxy", "HFNC", "NIV", "Thở máy"], check.breathingMode)}
            ${checkField("respiratoryRate", "Nhịp thở (lần/phút)", check.respiratoryRate, "text", "respiratory-rate-field")}
            ${checkArea("respiratoryNote", "Ghi chú hô hấp", check.respiratoryNote, "respiratory-note-field")}
            ${renderRespiratoryDetails(check)}
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
          <h3>Thần kinh cảm giác</h3>
          <div class="assessment-form compact-form">
            ${multiCheckGroup("neuroConsciousness", "Ý thức", ["Tỉnh táo, tiếp xúc tốt", "Lơ mơ", "Kích thích", "Ngủ gà", "Hôn mê"], check.neuroConsciousness)}
            ${multiCheckGroup("neuroOrientation", "Định hướng", ["Định hướng tốt thời gian, không gian, bản thân", "Rối loạn định hướng thời gian", "Rối loạn định hướng không gian", "Rối loạn định hướng bản thân"], check.neuroOrientation)}
            ${multiCheckGroup("neuroBehavior", "Tri giác - hành vi", ["Kích thích", "Vật vã", "Lo âu", "Không hợp tác", "Rối loạn hành vi", "Ảo giác", "Lú lẫn"], check.neuroBehavior)}
            ${multiCheckGroup("neuroFocalSigns", "Dấu hiệu thần kinh khu trú", ["Méo miệng", "Nói khó", "Nuốt khó", "Liệt dây thần kinh sọ", "Giảm phản xạ", "Tăng phản xạ gân xương"], check.neuroFocalSigns)}
          </div>
        </div>

        <div class="assessment-section-card">
          <h3>Tiêu hóa</h3>
          <div class="assessment-form compact-form">
            ${radioGroup("abdomen", "Bụng", ["Mềm", "Chướng", "Đau", "Có dẫn lưu"], check.abdomen)}
            ${radioGroup("stool", "Đại tiện", ["Bình thường", "Lỏng", "Táo", "Không đại tiện"], check.stool)}
          </div>
        </div>

        <div class="assessment-section-card">
          <h3>Bài tiết</h3>
          <div class="assessment-form compact-form">
            ${multiCheckGroup("urinary", "Bài tiết nước tiểu", ["Tự đi tiểu", "Tiểu qua sonde", "Thiểu niệu", "Vô niệu"], check.urinary)}
            ${checkField("urineAmount", "Số lượng nước tiểu (ml)", check.urineAmount)}
          </div>
        </div>

        <div class="assessment-section-card">
          <h3>Dinh dưỡng</h3>
          <div class="assessment-form compact-form">
            ${multiCheckGroup("nutritionType", "Dinh dưỡng", ["Cơm", "Cháo", "Soup", "Sonde dạ dày", "Tĩnh mạch", "Nhịn ăn"], check.nutritionType)}
            ${multiCheckGroup("menu", "Thực đơn", ["Cơm", "Cháo", "Soup", "Sữa", "Dịch nuôi ăn", "Khác"], check.menu)}
          </div>
        </div>

        <div class="assessment-section-card">
          <h3>Vận động/Phục hồi chức năng</h3>
          <div class="assessment-form compact-form mobility-rehab-form">
            ${multiCheckGroup("mobilityAbility", "Khả năng vận động", ["Tự đi lại bình thường", "Đi lại cần hỗ trợ", "Đi lại bằng dụng cụ hỗ trợ", "Không tự đi lại được", "Nằm bất động tại giường"], check.mobilityAbility)}
            ${multiCheckGroup("muscleStrength", "Tình trạng cơ lực", ["Cơ lực bình thường", "Yếu nhẹ", "Yếu 1 chi", "Yếu 2 chi", "Liệt nửa người", "Liệt tứ chi"], check.muscleStrength)}
            ${multiCheckGroup("movementStatus", "Tình trạng vận động", ["Hạn chế vận động", "Đau khi vận động", "Co cứng cơ", "Run tay chân", "Giảm thăng bằng"], check.movementStatus)}
          </div>
        </div>

        <div class="assessment-section-card">
          <h3>Giáo dục sức khỏe</h3>
          <div class="assessment-form compact-form">
            ${multiCheckGroup("treatmentEducation", "Hướng dẫn điều trị", ["Giải thích tình trạng bệnh", "Hướng dẫn dùng thuốc", "Hướng dẫn theo dõi dấu hiệu bất thường", "Hướng dẫn tái khám"], check.treatmentEducation)}
            ${multiCheckGroup("careEducation", "Hướng dẫn chăm sóc", ["Chế độ dinh dưỡng", "Chế độ vận động", "Vệ sinh cá nhân", "Chăm sóc vết mổ/vết thương", "Phòng ngừa loét tỳ đè", "Phòng ngừa té ngã"], check.careEducation)}
            ${multiCheckGroup("preventionEducation", "Giáo dục phòng bệnh", ["Không hút thuốc", "Hạn chế rượu bia", "Tuân thủ điều trị", "Kiểm soát đường huyết", "Kiểm soát huyết áp"], check.preventionEducation)}
          </div>
        </div>

        <div class="assessment-section-card">
          <h3>Cơ quan bị bệnh</h3>
          ${checkArea("diseasedOrgan", "Nhập nhận định cơ quan tổn thương", check.diseasedOrgan)}
        </div>

        <div class="assessment-section-card">
          <h3>Thang điểm đánh giá</h3>
          <div class="assessment-form compact-form">
            ${renderScaleCheckItem("fallRiskAssessment", "Đánh giá nguy cơ té ngã (Morse)", check.fallRiskAssessment)}
            ${renderScaleCheckItem("vteRiskAssessment", "Đánh giá mức độ viêm tĩnh mạch (VIP)", check.vteRiskAssessment)}
            ${renderScaleCheckItem("painAssessment", "Đánh giá đau (FLACC)", check.painAssessment)}
            ${renderScaleCheckItem("pressureUlcerRiskAssessment", "Đánh giá nguy cơ loét tỳ đè (Braden)", check.pressureUlcerRiskAssessment)}
            ${renderScaleCheckItem("glasgowAssessment", "Đánh giá Glasgow (GCS)", check.glasgowAssessment)}
          </div>
        </div>

        <div class="disease-checklist" style="display: none;">
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
                  <input value="${h(state.assessmentEdits[id] || "")}" placeholder="Nhập nhận định khác..." data-assessment-edit="${h(id)}" ${inputNextAttrs()} />
                </label>
              `).join("")}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderTemplateAssessmentPanel(assessments) {
  const sections = state.assessmentTemplate.assessment;
  return `
    <section class="panel assessment-checklist-panel structured-assessment">
      <div class="panel-header">
        <div>
          <h2 class="panel-title">Nhận định điều dưỡng</h2>
          <p class="panel-subtitle">Cấu trúc theo mẫu nhan_dinh.json.</p>
        </div>
      </div>
      <div class="panel-body">
        ${sections.map((section) => renderAssessmentTemplateField(section, true)).join("")}
        ${renderDiseaseAssessmentChecklist(assessments)}
      </div>
    </section>
  `;
}

function renderAssessmentTemplateField(fieldDef, asCard = false) {
  const idClass = templateFieldClass(fieldDef.id);
  const wrapperClass = asCard ? `assessment-section-card ${idClass}` : `assessment-template-group ${idClass}`;
  const formClass = `assessment-form compact-form template-field-grid ${idClass}-grid`;
  const heading = asCard ? "h3" : "h4";
  if (fieldDef.type === "group" || fieldDef.type === "object") {
    return `
      <div class="${wrapperClass}">
        <${heading}>${h(fieldDef.label)}</${heading}>
        <div class="${formClass}">
          ${(fieldDef.fields || []).map((field) => renderAssessmentTemplateField(field)).join("")}
        </div>
      </div>
    `;
  }
  if (fieldDef.type === "radio" || fieldDef.type === "radio_with_note") {
    return renderTemplateRadio(fieldDef);
  }
  if (fieldDef.type === "checkbox") {
    return renderTemplateCheckbox(fieldDef);
  }
  if (["text", "number", "date"].includes(fieldDef.type)) {
    if (fieldDef.id === "glasgow_score") {
      return renderGlasgowScoreField(fieldDef);
    }
    if (fieldDef.id === "fall_risk_score") {
      return renderFallRiskScoreField(fieldDef);
    }
    if (scaleResultFields[fieldDef.id]) {
      return renderScaleResultScoreField(fieldDef);
    }
    return checkField(fieldDef.id, withUnit(fieldDef.label, fieldDef.unit), state.assessmentChecklist[fieldDef.id] || "", fieldDef.type);
  }
  return checkField(fieldDef.id, fieldDef.label, state.assessmentChecklist[fieldDef.id] || "");
}

function templateFieldClass(id) {
  return `assessment-field-${String(id || "item").replace(/[^a-z0-9_-]/gi, "-")}`;
}

function renderGlasgowScoreField(fieldDef) {
  const result = state.scaleResults.glasgow_score;
  const value = state.assessmentChecklist.glasgow_score || "";
  return `
    <label class="assessment-field glasgow-score-field">
      <span>${h(withUnit(fieldDef.label, fieldDef.unit))}</span>
      <div class="score-input-action">
        <input type="number" value="${h(value)}" data-checklist="glasgow_score" ${inputNextAttrs("number")} />
        <button type="button" class="pain-score-btn" data-action="open-scale" data-scale-key="glasgow_score">
          ${result ? `Chấm lại: ${result.total} điểm` : "Chấm điểm Glasgow"}
        </button>
      </div>
      ${result ? `<span class="pain-score-summary">${h(result.risk)} - ${result.total} điểm</span>` : ""}
    </label>
  `;
}

function renderFallRiskScoreField(fieldDef) {
  const result = state.scaleResults.fall_risk_score;
  const value = state.assessmentChecklist.fall_risk_score || "";
  return `
    <label class="assessment-field fall-risk-score-field">
      <span>${h(withUnit(fieldDef.label, fieldDef.unit))}</span>
      <div class="score-input-action">
        <input type="number" value="${h(value)}" data-checklist="fall_risk_score" ${inputNextAttrs("number")} />
        <button type="button" class="pain-score-btn" data-action="open-scale" data-scale-key="fall_risk_score">
          ${result ? `Đánh giá lại: ${result.total} điểm` : "Đánh giá té ngã"}
        </button>
      </div>
      ${result ? `<span class="pain-score-summary">${h(result.risk)} - ${result.total} điểm</span>` : ""}
    </label>
  `;
}

function fallRiskValueFromResult(result) {
  if (!result || result.total === undefined) return "";
  if (result.total === 0) return "none";
  if (result.risk.includes("trung bình")) return "medium";
  if (result.risk.includes("cao")) return "high";
  return "low";
}

function renderScaleResultScoreField(fieldDef) {
  const result = state.scaleResults[fieldDef.id];
  const value = state.assessmentChecklist[fieldDef.id] || "";
  return `
    <label class="assessment-field scale-result-score-field">
      <span>${h(withUnit(fieldDef.label, fieldDef.unit))}</span>
      <div class="score-input-action">
        <input type="number" value="${h(value)}" data-checklist="${h(fieldDef.id)}" ${inputNextAttrs("number")} />
        <button type="button" class="pain-score-btn" data-action="open-scale" data-scale-key="${h(fieldDef.id)}">
          ${result ? `Đánh giá lại: ${result.total} điểm` : "Đánh giá"}
        </button>
      </div>
      ${result ? `<span class="pain-score-summary">${h(result.risk)} - ${result.total} điểm</span>` : ""}
    </label>
  `;
}

function normalizedOptions(options = []) {
  return options.map((option) =>
    typeof option === "string"
      ? { label: option, value: option }
      : { ...option, value: option.value ?? option.label },
  );
}

function withUnit(label, unit) {
  return unit ? `${label} (${unit})` : label;
}

function renderTemplateRadio(fieldDef) {
  const value = state.assessmentChecklist[fieldDef.id] || "";
  if (fieldDef.id === "current_pain") {
    return renderPainAssessmentRadio(fieldDef, value);
  }
  const options = normalizedOptions(fieldDef.options);
  const selectedOption = options.find((option) => option.value === value);
  return `
    <div class="assessment-full">
      ${radioGroup(fieldDef.id, fieldDef.label, options.map((option) => option.value), value, options)}
      ${
        selectedOption?.hasNote
          ? checkField(`${fieldDef.id}_note`, selectedOption.noteLabel || "Ghi rõ", state.assessmentChecklist[`${fieldDef.id}_note`] || "")
          : ""
      }
    </div>
  `;
}

function renderPainAssessmentRadio(fieldDef, value) {
  const options = normalizedOptions(fieldDef.options);
  const result = state.scaleResults.current_pain;
  return `
    <div class="assessment-full pain-assessment-row">
      <fieldset class="assessment-radio">
        <legend>${h(fieldDef.label)}</legend>
        <div>
          ${options
            .map((option) => `
              <label>
                <input type="radio" name="${h(fieldDef.id)}" value="${h(option.value)}" ${value === option.value ? "checked" : ""} data-checklist-radio="${h(fieldDef.id)}" />
                <span>${h(option.label)}</span>
                ${
                  option.value === "yes"
                    ? `<button type="button" class="pain-score-btn" data-action="open-scale" data-scale-key="current_pain">${result ? `Chấm lại: ${result.total} điểm` : "Chấm điểm đau"}</button>`
                    : ""
                }
              </label>
            `)
            .join("")}
        </div>
      </fieldset>
      ${
        result
          ? `<span class="pain-score-summary">${h(result.risk)} - ${result.total} điểm</span>`
          : ""
      }
    </div>
  `;
}

function renderTemplateCheckbox(fieldDef) {
  const selected = state.assessmentChecklist[fieldDef.id] || [];
  const options = normalizedOptions(fieldDef.options);
  return `
    <div class="assessment-full">
      ${multiCheckGroup(fieldDef.id, fieldDef.label, options.map((option) => option.value), selected, options)}
      ${options
        .filter((option) => option.hasNote && selected.includes(option.value))
        .map((option) =>
          checkField(
            `${fieldDef.id}_${option.value}_note`,
            option.noteLabel || `${option.label} - ghi rõ`,
            state.assessmentChecklist[`${fieldDef.id}_${option.value}_note`] || "",
          ),
        )
        .join("")}
    </div>
  `;
}

function renderDiseaseAssessmentChecklist(assessments) {
  return `
    <div class="disease-checklist" style="display: none;">
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
              <input value="${h(state.assessmentEdits[id] || "")}" placeholder="Nhập nhận định khác..." data-assessment-edit="${h(id)}" ${inputNextAttrs()} />
            </label>
          `).join("")}
      </div>
    </div>
  `;
}

function checkField(key, label, value, type = "text", className = "") {
  return `
    <label class="assessment-field ${h(className)}">
      <span>${h(label)}</span>
      <input type="${type}" value="${h(value)}" data-checklist="${key}" ${inputNextAttrs(type)} />
    </label>
  `;
}

function readonlyCheckField(key, label, value) {
  return `
    <label class="assessment-field">
      <span>${h(label)}</span>
      <input type="text" value="${h(value)}" data-checklist="${key}" readonly tabindex="-1" />
    </label>
  `;
}

function checkArea(key, label, value, className = "") {
  return `
    <label class="assessment-field assessment-full ${h(className)}">
      <span>${h(label)}</span>
      <textarea data-checklist="${key}" enterkeyhint="next" autocomplete="off" autocapitalize="sentences">${h(value)}</textarea>
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
      ${check.breathingMode === "Thở máy" ? multiCheckGroup("ventilationAirway", "Đường thở", ["NKQ", "MKQ"], check.ventilationAirway) : ""}
      ${checkField("ventilatorMode", "Mode", check.ventilatorMode, "text", "ventilator-setting-field")}
      ${checkField("fio2", "FiO2", check.fio2, "text", "ventilator-setting-field")}
      ${checkField("peep", "PEEP", check.peep, "text", "ventilator-setting-field")}
      ${checkField("vt", "VT", check.vt, "text", "ventilator-setting-field")}
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

function radioGroup(key, label, options, value, optionDefs = null) {
  return `
    <fieldset class="assessment-radio">
      <legend>${h(label)}</legend>
      <div>
        ${options
          .map((option, index) => {
            const optionLabel = optionDefs?.[index]?.label || option;
            return `
            <label>
              <input type="radio" name="${h(key)}" value="${h(option)}" ${value === option ? "checked" : ""} data-checklist-radio="${h(key)}" />
              <span>${h(optionLabel)}</span>
            </label>
          `;
          })
          .join("")}
      </div>
    </fieldset>
  `;
}

function multiCheckGroup(key, label, options, value = [], optionDefs = null) {
  const selected = Array.isArray(value) ? value : value ? [value] : [];
  return `
    <fieldset class="assessment-radio">
      <legend>${h(label)}</legend>
      <div>
        ${options
          .map((option, index) => {
            const optionLabel = optionDefs?.[index]?.label || option;
            return `
            <label>
              <input type="checkbox" value="${h(option)}" ${selected.includes(option) ? "checked" : ""} data-checklist-multi="${h(key)}" />
              <span>${h(optionLabel)}</span>
            </label>
          `;
          })
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

function renderScaleCheckItem(key, label, value) {
  const result = state.scaleResults[key];
  const hasResult = result && result.total !== undefined;
  
  // Extract base label name without any existing dynamic parentheses
  const baseLabel = label.split(" (")[0];
  const displayLabelHTML = hasResult
    ? `${h(baseLabel)} <strong class="scale-inline-score">(${result.total} điểm - ${h(result.risk)})</strong>`
    : h(label);

  return `
    <div class="scale-check-item ${hasResult ? 'has-result' : ''}">
      <label class="handover-check">
        <input type="checkbox" ${value ? "checked" : ""} data-scale-check="${h(key)}" />
        <span class="scale-label-text">${displayLabelHTML}</span>
      </label>
      ${hasResult ? `
        <button class="scale-edit-btn" data-action="open-scale" data-scale-key="${h(key)}" title="Chỉnh sửa" style="margin-left: 8px;">✎ Chỉnh sửa</button>
      ` : (value ? `
        <button class="scale-start-btn" data-action="open-scale" data-scale-key="${h(key)}" style="margin-left: 8px;">Bấm để chấm điểm →</button>
      ` : "")}
    </div>
  `;
}

function getScaleForKey(key) {
  const scaleId = scaleMapping[key];
  return state.scaleData.find((s) => s.id === scaleId) || null;
}

function calculateScaleResult(key) {
  const scale = getScaleForKey(key);
  if (!scale || !scale.items) return null;
  const scores = state.scaleScores[key] || {};
  let total = 0;
  let allFilled = true;
  for (const item of scale.items) {
    if (scores[item.key] !== undefined) {
      total += scores[item.key];
    } else {
      allFilled = false;
    }
  }
  let risk = "";
  let riskClass = "";
  if (allFilled && scale.riskInterpretation) {
    for (const level of scale.riskInterpretation) {
      if (total >= level.min && total <= level.max) {
        risk = level.risk;
        break;
      }
    }
    if (risk.includes("rất cao") || risk.includes("nặng") || risk.includes("Nặng") || risk.includes("cấp cứu")) riskClass = "risk-very-high";
    else if (risk.includes("cao") || risk.includes("tiến triển")) riskClass = "risk-high";
    else if (risk.includes("trung bình") || risk.includes("vừa") || risk.includes("Trung bình")) riskClass = "risk-medium";
    else riskClass = "risk-low";
  }
  return { total, risk, riskClass, allFilled };
}

function renderScaleModal() {
  const key = state.activeScale;
  const scale = getScaleForKey(key);
  if (!scale) return "";
  const scores = state.scaleScores[key] || {};
  const result = calculateScaleResult(key);
  return `
    <div class="scale-modal-overlay" data-action="close-scale-overlay">
      <div class="scale-modal">
        <div class="scale-modal-header">
          <h2>${h(scale.name)}</h2>
          <button class="scale-modal-close" data-action="close-scale">✕</button>
        </div>
        <div class="scale-modal-body">
          <p class="scale-rule">Quy tắc: ${h(scale.totalScoreRule)}</p>
          ${scale.items.map((item) => `
            <fieldset class="scale-fieldset">
              <legend>${h(item.label)}</legend>
              <div class="scale-options">
                ${item.options.map((opt) => `
                  <label class="scale-option ${scores[item.key] === opt.score ? 'selected' : ''}">
                    <input type="radio" name="scale_${h(item.key)}" value="${opt.score}" ${scores[item.key] === opt.score ? 'checked' : ''} data-scale-item="${h(key)}:${h(item.key)}" />
                    <span class="scale-option-label">${h(opt.label)}</span>
                    <span class="scale-option-score">${opt.score}</span>
                  </label>
                `).join("")}
              </div>
            </fieldset>
          `).join("")}
        </div>
        <div class="scale-modal-footer">
          <div class="scale-modal-result">
            <span class="scale-total">Tổng: <strong>${result ? result.total : 0}</strong> điểm</span>
            ${result && result.allFilled && result.risk ? `<span class="scale-risk ${result.riskClass}">${h(result.risk)}</span>` : '<span class="scale-risk-pending">Chưa đánh giá đủ</span>'}
          </div>
          <div class="scale-modal-actions">
            <button class="btn ghost" data-action="close-scale">Hủy</button>
            <button class="btn primary" data-action="save-scale">Lưu kết quả</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderDiagnosisPanel() {
  return `
    <section class="panel">
      <div class="panel-header">
        <div>
          <h2 class="panel-title">Chẩn đoán điều dưỡng & mục tiêu</h2>
          <p class="panel-subtitle">Gõ keyword để tìm chẩn đoán và mục tiêu từ danh sách gợi ý theo mặt bệnh.</p>
        </div>
        <span class="step-badge">3</span>
      </div>
      <div class="panel-body">
        <div class="diagnosis-grid">
          ${state.diagnosisRows
            .map(
              (row, index) => {
                const diagnosisOptions = state.activeDiagnosisSuggest === index ? filteredDiagnosisOptions(row) : [];
                const goals = (Array.isArray(row.goals) && row.goals.length ? row.goals : row.goalQuery ? [row.goalQuery] : [""]);
                return `
              <div class="diagnosis-item">
                <div class="diagnosis-row-main">
                  <div class="field diagnosis-search-field">
                    <label>Chẩn đoán điều dưỡng</label>
                    <input type="search" value="${h(row.diagnosisQuery || row.diagnosis || "")}" placeholder="Gõ keyword tìm chẩn đoán..." data-dx-query="${index}" ${inputNextAttrs("search")} />
                    ${diagnosisOptions.length ? `
                      <div class="suggestion-list">
                        ${diagnosisOptions.map((item) => `
                          <button type="button" data-dx-suggestion="${index}" data-value="${h(item.diagnosis)}">${h(item.diagnosis)}</button>
                        `).join("")}
                      </div>
                    ` : ""}
                  </div>
                  <button class="remove-row-btn" data-action="remove-diagnosis" data-index="${index}" aria-label="Xóa chẩn đoán">Xóa</button>
                </div>
                <div class="diagnosis-goals">
                  ${goals.map((goal, goalIndex) => {
                    const goalKey = `${index}:${goalIndex}`;
                    const goalOptions = state.activeGoalSuggest === goalKey ? filteredGoalOptions(row, goal) : [];
                    return `
                      <div class="diagnosis-goal-block">
                        <div class="field diagnosis-search-field">
                          <label>Mục tiêu ${goalIndex + 1}</label>
                          <input type="search" value="${h(goal)}" placeholder="Gõ keyword tìm mục tiêu..." data-goal-query="${goalKey}" ${inputNextAttrs("search")} />
                          ${goalOptions.length ? `
                            <div class="suggestion-list">
                              ${goalOptions.map((option) => `
                                <button type="button" data-goal-suggestion="${goalKey}" data-value="${h(option)}">${h(option)}</button>
                              `).join("")}
                            </div>
                          ` : ""}
                        </div>
                        ${goals.length > 1 ? `<button class="remove-row-btn" data-action="remove-goal" data-index="${index}" data-goal-index="${goalIndex}" aria-label="Xóa mục tiêu">Xóa</button>` : ""}
                      </div>
                    `;
                  }).join("")}
                </div>
                <button class="btn diagnosis-add-goal-btn" data-action="add-goal" data-index="${index}">Thêm mục tiêu</button>
              </div>
            `;
              },
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
        ${state.interventionRows.length ? `
          <div class="intervention-grid">
            ${state.interventionRows
              .map(
                (row, index) => {
                  const codeOptions = state.activeInterventionSuggest === `code:${index}`
                    ? filteredInterventionOptions(row.code, "code")
                    : [];
                  const contentOptions = state.activeInterventionSuggest === `content:${index}`
                    ? filteredInterventionOptions(row.content, "content")
                    : [];
                  return `
                <div class="intervention-item">
                  <div class="intervention-row-fields">
                    <div class="field intervention-search-field intervention-code-field">
                      <label>Mã can thiệp</label>
                      <input value="${h(row.code)}" placeholder="Nhập mã..." data-iv-code-query="${index}" ${inputNextAttrs()} />
                      ${codeOptions.length ? `
                        <div class="suggestion-list">
                          ${codeOptions.map((item) => `
                            <button type="button" data-iv-suggestion="${index}" data-code="${h(item.code)}" data-content="${h(item.name)}">
                              <strong>${h(item.code)}</strong> - ${h(item.name)}
                            </button>
                          `).join("")}
                        </div>
                      ` : ""}
                    </div>
                    <div class="field intervention-search-field">
                      <label>Nội dung can thiệp</label>
                      <input value="${h(row.content)}" placeholder="Nhập nội dung..." data-iv-content-query="${index}" ${inputNextAttrs()} />
                      ${contentOptions.length ? `
                        <div class="suggestion-list">
                          ${contentOptions.map((item) => `
                            <button type="button" data-iv-suggestion="${index}" data-code="${h(item.code)}" data-content="${h(item.name)}">
                              <strong>${h(item.code)}</strong> - ${h(item.name)}
                            </button>
                          `).join("")}
                        </div>
                      ` : ""}
                    </div>
                  </div>
                  <button class="remove-row-btn" data-action="remove-intervention" data-index="${index}" aria-label="Xóa gợi ý">Xóa</button>
                </div>
              `;
                },
              )
              .join("")}
          </div>
        ` : ""}
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
  const checklistItems = state.assessmentTemplate ? [] : assessmentChecklistSummary();
  const assessments = assessmentIds
    .filter((item) => state.selectedAssessments.has(item.id))
    .map((item) => state.assessmentEdits[item.id] ?? item.result)
    .filter(Boolean);
  [...state.selectedAssessments]
    .filter((id) => id.startsWith("custom-assessment-"))
    .forEach((id) => {
      if (state.assessmentEdits[id]) assessments.push(state.assessmentEdits[id]);
    });
  const diagnoses = selectedCareDiagnoses().map((row) => ({
    diagnosis: row.diagnosis,
    goal: row.goals.join("\n"),
  }));
  const interventions = selectedCareInterventions();
  
  // Build comprehensive assessment sections for sheet
  const sheetSections = buildAssessmentSectionsForSheet();
  
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
                <span>Chẩn đoán y khoa: ${h(condition.ten_mat_benh || ".....")}</span>
              </div>
            </div>
            <strong>${h(currentCategory().ten_nhom)} / ${h(currentDepartment().ten_khoa)}</strong>
          </header>
          ${sheetList("I. Nhận định điều dưỡng", [...checklistItems, ...sheetSections, ...assessments])}
          ${sheetDiagnosis(diagnoses)}
          ${sheetInterventions(interventions)}
        </article>
      </div>
    </section>
  `;
}

function selectedCareDiagnoses() {
  return state.diagnosisRows
    .map((row) => ({
      diagnosis: cleanLine(row.diagnosis),
      goals: (Array.isArray(row.goals) ? row.goals : row.goal ? [row.goal] : [])
        .map(cleanLine)
        .filter(Boolean)
        .filter((value, index, values) => values.indexOf(value) === index),
    }))
    .filter((row) => row.diagnosis || row.goals.length);
}

function selectedCareInterventions() {
  return state.interventionRows
    .filter((row) => row.selected && (cleanLine(row.code) || cleanLine(row.content)))
    .map((row) => ({
      code: cleanLine(row.code),
      content: cleanLine(row.content),
    }));
}

function handoverPayload() {
  const check = state.assessmentChecklist;
  return {
    handoverMedicineHalf: check.handoverMedicineHalf,
    handoverLab: check.handoverLab,
    handoverWaitLab: check.handoverWaitLab,
    handoverFilm: check.handoverFilm,
    handoverWaitFilm: check.handoverWaitFilm,
    handoverDressing: check.handoverDressing,
    handoverDrain: check.handoverDrain,
    handoverVitals: check.handoverVitals,
    handoverUrine: check.handoverUrine,
    handoverTube: check.handoverTube,
    handoverOther: check.handoverOther,
  };
}

async function saveCareSheetToSupabase() {
  const client = getSupabaseClient();
  const selected = patients[state.selectedPatientIndex] || patients[0];
  const condition = currentCondition();
  const department = currentDepartment();
  const category = currentCategory();
  const diagnoses = selectedCareDiagnoses();
  const interventions = selectedCareInterventions();
  const evalTime = state.assessmentChecklist.evalTime || currentVietnamDateTimeInput();
  const editingSheetId = state.editingCareSheetId;
  state.assessmentChecklist.fluidBalance = calculateFluidBalance(
    state.assessmentChecklist.fluidIn,
    state.assessmentChecklist.fluidOut,
  );

  const patientPayload = {
    ma_benh_nhan: selected.code,
    ho_ten: selected.name,
    tuoi: selected.age,
    gioi_tinh: selected.sex,
    phong: selected.room,
    giuong: selected.bed || null,
    khoa: department.ten_khoa,
    chan_doan_y_khoa: condition.ten_mat_benh,
  };

  const { data: existingPatient, error: findPatientError } = await client
    .from("dsbn")
    .select("id")
    .eq("ma_benh_nhan", selected.code)
    .maybeSingle();
  if (findPatientError) throw findPatientError;

  let patientId = existingPatient?.id;
  if (patientId) {
    const { error } = await client.from("dsbn").update(patientPayload).eq("id", patientId);
    if (error) throw error;
  } else {
    const { data, error } = await client.from("dsbn").insert(patientPayload).select("id").single();
    if (error) throw error;
    patientId = data.id;
  }

  const sheetPayload = {
    benh_nhan_id: patientId,
    cap_cham_soc: state.careLevel,
    thoi_gian_danh_gia: evalTime,
    nguoi_danh_gia: state.assessmentChecklist.evaluator,
    nhan_dinh_json: {
      checklist: state.assessmentChecklist,
      sections: buildAssessmentSectionsForSheet(),
      category: category.ten_nhom,
      department: department.ten_khoa,
      condition: condition.ten_mat_benh,
    },
    chan_doan_muc_tieu_json: diagnoses,
    can_thiep_json: interventions,
    ban_giao_json: handoverPayload(),
    thang_diem_json: state.scaleResults,
  };

  let sheetId = editingSheetId;
  if (editingSheetId) {
    const { error: sheetError } = await client
      .from("danh_sach_phieu_cs")
      .update(sheetPayload)
      .eq("id", editingSheetId);
    if (sheetError) throw sheetError;
  } else {
    const { data: sheet, error: sheetError } = await client
      .from("danh_sach_phieu_cs")
      .insert({
        ...sheetPayload,
        ma_phieu: `CS-${Date.now()}`,
      })
      .select("id")
      .single();
    if (sheetError) throw sheetError;
    sheetId = sheet.id;
  }

  await syncCareSheetGoals(client, sheetId, diagnoses, evalTime);

  return sheetId;
}

async function syncCareSheetGoals(client, sheetId, diagnoses, evalTime) {
  const goalRows = diagnoses.flatMap((row) =>
    row.goals.map((goal) => ({
      phieu_cs_id: sheetId,
      thoi_gian_dat_muc_tieu: evalTime,
      muc_tieu: goal,
    })),
  );

  if (!state.editingCareSheetId) {
    if (goalRows.length) {
      const { error } = await client.from("danh_gia_ket_qua").insert(goalRows);
      if (error) throw error;
    }
    return;
  }

  const { data: existingGoals, error: loadGoalsError } = await client
    .from("danh_gia_ket_qua")
    .select("id, muc_tieu")
    .eq("phieu_cs_id", sheetId)
    .order("id", { ascending: true });
  if (loadGoalsError) throw loadGoalsError;

  const usedGoalIds = new Set();
  const rowsToInsert = [];
  for (const row of goalRows) {
    const matched = (existingGoals || []).find(
      (item) => !usedGoalIds.has(item.id) && cleanLine(item.muc_tieu) === cleanLine(row.muc_tieu),
    );
    if (matched) {
      usedGoalIds.add(matched.id);
      const { error } = await client
        .from("danh_gia_ket_qua")
        .update({ thoi_gian_dat_muc_tieu: evalTime, muc_tieu: row.muc_tieu })
        .eq("id", matched.id);
      if (error) throw error;
    } else {
      rowsToInsert.push(row);
    }
  }

  const removedGoalIds = (existingGoals || [])
    .filter((item) => !usedGoalIds.has(item.id))
    .map((item) => item.id);
  if (removedGoalIds.length) {
    const { error } = await client.from("danh_gia_ket_qua").delete().in("id", removedGoalIds);
    if (error) throw error;
  }
  if (rowsToInsert.length) {
    const { error } = await client.from("danh_gia_ket_qua").insert(rowsToInsert);
    if (error) throw error;
  }
}

async function updateGoalEvaluation(goalId, evalValue) {
  if (!isSupabaseConfigured()) {
    alert("Chưa cấu hình Supabase");
    return;
  }

  try {
    const currentTime = currentVietnamDateTimeInput(true);
    const { error } = await supabaseClient
      .from("danh_gia_ket_qua")
      .update({
        danh_gia: evalValue,
        thoi_gian_ket_thuc_muc_tieu: currentTime,
      })
      .eq("id", goalId);

    if (error) throw error;

    // Update local state
    const goalItem = state.careGoalEvaluations.find((item) => String(item.id) === String(goalId));
    if (goalItem) {
      goalItem.danh_gia = evalValue;
      goalItem.thoi_gian_ket_thuc_muc_tieu = currentTime;
    }

    render();
  } catch (error) {
    alert(`Không cập nhật được đánh giá: ${error.message || error}`);
  }
}

async function loadCareSheetsForSelectedPatient(force = false) {
  const selected = patients[state.selectedPatientIndex] || patients[0];
  if (!selected?.code) return;
  if (!force && (state.careSheetsLoading || state.careSheetsLoadedFor === selected.code)) return;

  state.careSheetsLoading = true;
  state.careSheetsError = "";
  state.careSheetsLoadedFor = selected.code;

  if (!isSupabaseConfigured()) {
    state.careSheets = [];
    state.careSheetsLoading = false;
    state.careSheetsError = "Chưa cấu hình Supabase nên chưa tải được danh sách phiếu.";
    setTimeout(() => {
      if (state.screen === "careEmpty") render();
    }, 0);
    return;
  }

  try {
    const client = getSupabaseClient();
    const { data: patient, error: patientError } = await client
      .from("dsbn")
      .select("id")
      .eq("ma_benh_nhan", selected.code)
      .maybeSingle();
    if (patientError) throw patientError;

    if (!patient) {
      state.careSheets = [];
      return;
    }

    const { data, error } = await client
      .from("danh_sach_phieu_cs")
      .select("id, ma_phieu, cap_cham_soc, thoi_gian_danh_gia, nguoi_danh_gia, nhan_dinh_json, chan_doan_muc_tieu_json, can_thiep_json, ban_giao_json, thang_diem_json, created_at")
      .eq("benh_nhan_id", patient.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    state.careSheets = data || [];
  } catch (error) {
    state.careSheets = [];
    state.careSheetsError = `Không tải được danh sách phiếu: ${error.message || error}`;
  } finally {
    state.careSheetsLoading = false;
    if (state.screen === "careEmpty") render();
  }
}

async function loadCareGoalEvaluationsForSelectedPatient(force = false) {
  const selected = patients[state.selectedPatientIndex] || patients[0];
  if (!selected?.code) return;
  if (!force && (state.careGoalEvaluationsLoading || state.careGoalEvaluationsLoadedFor === selected.code)) return;

  state.careGoalEvaluationsLoading = true;
  state.careGoalEvaluationsError = "";
  state.careGoalEvaluationsLoadedFor = selected.code;

  if (!isSupabaseConfigured()) {
    state.careGoalEvaluations = [];
    state.careGoalEvaluationsLoading = false;
    state.careGoalEvaluationsError = "Chưa cấu hình Supabase nên chưa tải được mục tiêu chăm sóc.";
    setTimeout(() => {
      if (state.screen === "careEvaluation") render();
    }, 0);
    return;
  }

  try {
    const client = getSupabaseClient();
    const { data: patient, error: patientError } = await client
      .from("dsbn")
      .select("id")
      .eq("ma_benh_nhan", selected.code)
      .maybeSingle();
    if (patientError) throw patientError;

    if (!patient) {
      state.careGoalEvaluations = [];
      return;
    }

    const { data: sheets, error: sheetsError } = await client
      .from("danh_sach_phieu_cs")
      .select("id")
      .eq("benh_nhan_id", patient.id);
    if (sheetsError) throw sheetsError;

    const sheetIds = (sheets || []).map((sheet) => sheet.id);
    if (!sheetIds.length) {
      state.careGoalEvaluations = [];
      return;
    }

    const { data, error } = await client
      .from("danh_gia_ket_qua")
      .select("id, phieu_cs_id, thoi_gian_dat_muc_tieu, muc_tieu, danh_gia, thoi_gian_ket_thuc_muc_tieu")
      .in("phieu_cs_id", sheetIds)
      .order("thoi_gian_dat_muc_tieu", { ascending: false });
    if (error) throw error;
    state.careGoalEvaluations = data || [];
  } catch (error) {
    state.careGoalEvaluations = [];
    state.careGoalEvaluationsError = `Không tải được mục tiêu chăm sóc: ${error.message || error}`;
  } finally {
    state.careGoalEvaluationsLoading = false;
    if (state.screen === "careEvaluation") render();
  }
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
    ventilationAirway: "Đường thở",
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
    mobilityAbility: "Khả năng vận động",
    muscleStrength: "Tình trạng cơ lực",
    movementStatus: "Tình trạng vận động",
    treatmentEducation: "Hướng dẫn điều trị",
    careEducation: "Hướng dẫn chăm sóc",
    preventionEducation: "Giáo dục phòng bệnh",
    circulationNote: "Tuần hoàn",
    respiratoryNote: "Ghi chú hô hấp",
    neuroConsciousness: "Ý thức",
    neuroOrientation: "Định hướng",
    neuroBehavior: "Tri giác - hành vi",
    neuroFocalSigns: "Dấu hiệu thần kinh khu trú",
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
    fallRiskAssessment: "Thang điểm đánh giá: Nguy cơ té ngã",
    vteRiskAssessment: "Thang điểm đánh giá: Nguy cơ viêm tĩnh mạch",
    painAssessment: "Thang điểm đánh giá: Đau",
    pressureUlcerRiskAssessment: "Thang điểm đánh giá: Nguy cơ loét tỳ đè",
    glasgowAssessment: "Thang điểm đánh giá: Glasgow",
  };
  return Object.entries(state.assessmentChecklist)
    .filter(([, value]) =>
      typeof value === "boolean" ? value : Array.isArray(value) ? value.length : cleanLine(value),
    )
    .map(([key, value]) => {
      if (typeof value === "boolean") {
        const scaleRes = state.scaleResults[key];
        if (scaleRes && scaleRes.total !== undefined) {
          return `${booleanLabels[key]} - Kết quả: ${scaleRes.total} điểm (${scaleRes.risk})`;
        }
        return booleanLabels[key];
      }
      if (Array.isArray(value)) return `${labels[key] || key}: ${value.join(", ")}`;
      return `${labels[key] || key}: ${value}`;
    });
}

function buildAssessmentSectionsForSheet() {
  const check = state.assessmentChecklist;
  const sections = [];
  
  const sectionGroups = {
    "A. Thông tin người bệnh": ["evalTime", "evaluator", "height", "weight", "bmi", "allergy", "allergy_note"],
    ...(state.careLevel === "1" ? { "B. Theo dõi dịch": ["fluidIn", "fluidOut", "fluidBalance"] } : {}),
    "C. Dấu hiệu sinh tồn": ["pulse", "temperature", "bloodPressure", "spo2"],
    "D. Toàn thân": ["bodyType", "consciousness", "mucosa", "edema", "systemicNote"],
    "E. Hô hấp": ["breathingMode", "respiratoryRate", "respiratoryNote", "oxygenFlow", "ventilationAirway", "ventilatorMode", "fio2", "peep", "vt"],
    "F. Tuần hoàn": ["circulationStable", "circulationFastPulse", "circulationHypotension", "circulationShock", "circulationVasopressor", "vasopressorNoradrenaline", "vasopressorAdrenaline", "vasopressorDobutamine", "vasopressorVasopressin", "vasopressorOther", "circulationNote"],
    "G. Thần kinh cảm giác": ["neuroConsciousness", "neuroOrientation", "neuroBehavior", "neuroFocalSigns"],
    "H. Tiêu hóa": ["abdomen", "stool"],
    "I. Bài tiết": ["urinary", "urineAmount"],
    "J. Dinh dưỡng": ["nutritionType", "menu"],
    "K. Vận động/Phục hồi chức năng": ["mobilityAbility", "muscleStrength", "movementStatus"],
    "L. Giáo dục sức khỏe": ["treatmentEducation", "careEducation", "preventionEducation"],
    "M. Cơ quan bị bệnh": ["diseasedOrgan"],
    "N. Thang điểm đánh giá": ["fallRiskAssessment", "vteRiskAssessment", "painAssessment", "pressureUlcerRiskAssessment", "glasgowAssessment"],
    "O. Bàn giao": ["handoverMedicineHalf", "handoverLab", "handoverWaitLab", "handoverFilm", "handoverWaitFilm", "handoverDressing", "handoverDrain", "handoverVitals", "handoverUrine", "handoverTube", "handoverOther"]
  };
  
  const labels = {
    evalTime: "Thời gian đánh giá", evaluator: "Người đánh giá", height: "Chiều cao", weight: "Cân nặng", bmi: "BMI", allergy: "Dị ứng", allergy_note: "Thông tin dị ứng",
    fluidIn: "Dịch vào", fluidOut: "Dịch ra", fluidBalance: "Bilance",
    pulse: "Mạch", temperature: "Nhiệt độ", bloodPressure: "Huyết áp", spo2: "SpO2",
    bodyType: "Thể trạng", consciousness: "Ý thức", mucosa: "Da niêm mạc", edema: "Phù", systemicNote: "Ghi chú",
    breathingMode: "Hô hấp", respiratoryRate: "Nhịp thở", respiratoryNote: "Ghi chú", oxygenFlow: "Lưu lượng oxy", ventilationAirway: "Đường thở", ventilatorMode: "Mode thở máy", fio2: "FiO2", peep: "PEEP", vt: "VT",
    circulationStable: "Ổn định", circulationFastPulse: "Mạch nhanh", circulationHypotension: "Hạ huyết áp", circulationShock: "Sốc", circulationVasopressor: "Có vận mạch", vasopressorNoradrenaline: "Noradrenaline", vasopressorAdrenaline: "Adrenaline", vasopressorDobutamine: "Dobutamine", vasopressorVasopressin: "Vasopressin", vasopressorOther: "Khác", circulationNote: "Ghi chú",
    neuroSensory: "Thần kinh cảm giác", neuroConsciousness: "Ý thức", neuroOrientation: "Định hướng", neuroBehavior: "Tri giác - hành vi", neuroFocalSigns: "Dấu hiệu thần kinh khu trú",
    abdomen: "Bụng", stool: "Đại tiện",
    urinary: "Bài tiết nước tiểu", urineAmount: "Số lượng nước tiểu",
    nutritionType: "Loại", menu: "Thực đơn",
    mobilityAbility: "Khả năng vận động", muscleStrength: "Tình trạng cơ lực", movementStatus: "Tình trạng vận động", mobilityRehab: "Vận động/PHCN", treatmentEducation: "Hướng dẫn điều trị", careEducation: "Hướng dẫn chăm sóc", preventionEducation: "Giáo dục phòng bệnh", healthEducation: "Giáo dục sức khỏe",
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
        const scaleRes = state.scaleResults[field];
        if (scaleRes && scaleRes.total !== undefined) {
          items.push(`${labels[field] || field}: ${scaleRes.total} điểm (${scaleRes.risk})`);
        } else {
          items.push(`${labels[field] || field}: Có`);
        }
      } else if (Array.isArray(value)) {
        items.push(`${labels[field] || field}: ${value.join(", ")}`);
      } else if (field === "allergy") {
        items.push(`${labels[field]}: ${value === "yes" ? "Có" : "Không"}`);
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

function buildTemplateAssessmentSectionsForSheet(fields, prefix = "") {
  return fields.flatMap((fieldDef) => {
    const label = prefix ? `${prefix} - ${fieldDef.label}` : fieldDef.label;
    if (fieldDef.type === "group" || fieldDef.type === "object") {
      return buildTemplateAssessmentSectionsForSheet(fieldDef.fields || [], label);
    }

    const value = state.assessmentChecklist[fieldDef.id];
    if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
      return [];
    }

    const options = normalizedOptions(fieldDef.options);
    const displayValue = Array.isArray(value)
      ? value.map((item) => optionText(options, item)).join(", ")
      : optionText(options, value);
    const notes = templateNotesForField(fieldDef, value);
    return [`${label}: ${[displayValue, ...notes].filter(Boolean).join("; ")}`];
  });
}

function optionText(options, value) {
  return options.find((option) => option.value === value)?.label || value;
}

function templateNotesForField(fieldDef, value) {
  const options = normalizedOptions(fieldDef.options);
  if (!options.length) {
    const note = state.assessmentChecklist[`${fieldDef.id}_note`];
    return note ? [`Ghi rõ: ${note}`] : [];
  }

  const selectedValues = Array.isArray(value) ? value : [value];
  return options
    .filter((option) => option.hasNote && selectedValues.includes(option.value))
    .map((option) => {
      const noteKey = Array.isArray(value) ? `${fieldDef.id}_${option.value}_note` : `${fieldDef.id}_note`;
      const note = state.assessmentChecklist[noteKey];
      return note ? `${option.noteLabel || "Ghi rõ"}: ${note}` : "";
    })
    .filter(Boolean);
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
  // Handle scale modal overlay click (div, not button)
  if (event.target.dataset.action === "close-scale-overlay") {
    state.activeScale = null;
    render();
    return;
  }

  const target = event.target.closest("button");
  if (!target) return;

  if (target.dataset.patientIndex) {
    state.selectedPatientIndex = Number(target.dataset.patientIndex);
    state.careSheets = [];
    state.careSheetsLoadedFor = "";
    state.careSheetsError = "";
    state.careGoalEvaluations = [];
    state.careGoalEvaluationsLoadedFor = "";
    state.careGoalEvaluationsError = "";
    state.editingCareSheetId = null;
    state.selectedCareSheetId = null;
    resetCareFormState({ resetChecklist: true });
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
    state.editingCareSheetId = null;
    state.selectedCareSheetId = null;
    state.screen = "careForm";
    resetForCondition({ resetChecklist: true });
    return;
  }

  if (target.dataset.action === "evaluate-results") {
    state.screen = "careEvaluation";
    render();
    return;
  }

  if (target.dataset.action === "view-care-sheet") {
    state.selectedCareSheetId = target.dataset.sheetId;
    state.screen = "careDetail";
    render();
    return;
  }

  if (target.dataset.action === "edit-care-sheet") {
    const sheet = state.careSheets.find((item) => String(item.id) === String(target.dataset.sheetId));
    if (!sheet) {
      alert("Không tìm thấy phiếu chăm sóc để sửa.");
      return;
    }
    hydrateCareFormFromSheet(sheet);
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

  if (target.dataset.dxSuggestion) {
    const row = state.diagnosisRows[Number(target.dataset.dxSuggestion)];
    if (row) {
      row.diagnosis = target.dataset.value || "";
      row.diagnosisQuery = row.diagnosis;
      row.goalQuery = "";
      state.activeDiagnosisSuggest = null;
      state.activeGoalSuggest = null;
      if (!Array.isArray(row.goals)) row.goals = row.goal ? [row.goal] : [];
    }
    render();
    return;
  }

  if (target.dataset.goalSuggestion) {
    const [rowIndex, goalIndex] = target.dataset.goalSuggestion.split(":").map(Number);
    const row = state.diagnosisRows[rowIndex];
    const goal = cleanLine(target.dataset.value);
    if (row && goal) {
      if (!Array.isArray(row.goals)) row.goals = row.goal ? [row.goal] : [];
      row.goals[goalIndex] = goal;
      state.activeGoalSuggest = null;
    }
    render();
    return;
  }

  if (target.dataset.ivSuggestion) {
    const row = state.interventionRows[Number(target.dataset.ivSuggestion)];
    applyInterventionOption(row, {
      code: target.dataset.code || "",
      name: target.dataset.content || "",
    });
    state.activeInterventionSuggest = null;
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
    state.diagnosisRows.push(createDiagnosisRow());
    render();
    return;
  }

  if (target.dataset.action === "remove-diagnosis") {
    state.diagnosisRows.splice(Number(target.dataset.index), 1);
    if (!state.diagnosisRows.length) state.diagnosisRows.push(createDiagnosisRow());
    render();
    return;
  }

  if (target.dataset.action === "add-goal") {
    const row = state.diagnosisRows[Number(target.dataset.index)];
    if (row) {
      if (!Array.isArray(row.goals)) row.goals = row.goal ? [row.goal] : [];
      row.goals.push("");
      state.activeGoalSuggest = `${target.dataset.index}:${row.goals.length - 1}`;
    }
    render();
    return;
  }

  if (target.dataset.action === "remove-goal") {
    const row = state.diagnosisRows[Number(target.dataset.index)];
    if (row && Array.isArray(row.goals)) {
      row.goals.splice(Number(target.dataset.goalIndex), 1);
    }
    render();
    return;
  }

  if (target.dataset.action === "add-intervention") {
    state.interventionRows.push({ id: `iv-${Date.now()}`, selected: true, code: "", content: "" });
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

  if (target.dataset.action === "set-goal-evaluation") {
    const goalId = target.dataset.goalId;
    const evalValue = target.dataset.evalValue;
    if (goalId && evalValue) {
      updateGoalEvaluation(goalId, evalValue);
    }
    return;
  }

  if (target.dataset.action === "save-care") {
    const originalText = target.textContent;
    target.disabled = true;
    target.textContent = "Đang lưu...";
    saveCareSheetToSupabase()
      .then((sheetId) => {
        state.careSheetsLoadedFor = "";
        state.careGoalEvaluationsLoadedFor = "";
        alert(`${state.editingCareSheetId ? "Đã cập nhật" : "Đã lưu"} phiếu chăm sóc #${sheetId}`);
      })
      .catch((error) => {
        alert(`Không lưu được phiếu: ${error.message || error}`);
      })
      .finally(() => {
        target.disabled = false;
        target.textContent = originalText;
      });
    return;
  }

  if (target.dataset.action === "print") {
    window.print();
  }

  if (target.dataset.action === "open-scale" && target.dataset.scaleKey) {
    if (target.dataset.scaleKey === "current_pain") {
      state.assessmentChecklist.current_pain = "yes";
    }
    state.activeScale = target.dataset.scaleKey;
    if (!state.scaleScores[target.dataset.scaleKey]) state.scaleScores[target.dataset.scaleKey] = {};
    render();
    return;
  }

  if (target.dataset.action === "close-scale" || target.dataset.action === "close-scale-overlay") {
    state.activeScale = null;
    render();
    return;
  }

  if (target.dataset.action === "save-scale") {
    const key = state.activeScale;
    if (key) {
      const result = calculateScaleResult(key);
      if (result && result.allFilled) {
        state.scaleResults[key] = result;
        if (key === "current_pain") {
          state.assessmentChecklist.current_pain = "yes";
          state.assessmentChecklist.pain_score = String(result.total);
        }
        if (key === "glasgow_score") {
          state.assessmentChecklist.glasgow_score = String(result.total);
        }
        if (key === "fall_risk_score") {
          state.assessmentChecklist.fall_risk_score = String(result.total);
          state.assessmentChecklist.fall_risk = fallRiskValueFromResult(result);
        }
        if (scaleResultFields[key]) {
          state.assessmentChecklist[key] = String(result.total);
          state.assessmentChecklist[scaleResultFields[key]] = result.risk;
        }
        state.activeScale = null;
        render();
      } else {
        alert("Vui lòng đánh giá đầy đủ tất cả các mục trước khi lưu kết quả!");
      }
    } else {
      state.activeScale = null;
      render();
    }
    return;
  }
});

app.addEventListener("keydown", (event) => {
  const target = event.target;
  if (!target.closest?.(".form-mode")) return;
  const isEditableInput = target.matches?.(
    'input:not([type="checkbox"]):not([type="radio"]):not([readonly]):not([disabled]), textarea:not([readonly]):not([disabled])',
  );
  if (!isEditableInput) return;

  if (event.key === "Enter" && !event.ctrlKey && !event.altKey && !event.metaKey && !event.shiftKey) {
    if (focusNextCareInput(target)) event.preventDefault();
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

  if (target.dataset.dxQuery) {
    const row = state.diagnosisRows[Number(target.dataset.dxQuery)];
    if (row) {
      row.diagnosisQuery = target.value;
      row.diagnosis = target.value;
      state.activeDiagnosisSuggest = Number(target.dataset.dxQuery);
      state.activeGoalSuggest = null;
      render(`[data-dx-query="${target.dataset.dxQuery}"]`);
    }
    return;
  }

  if (target.dataset.goalQuery) {
    const [rowIndex, goalIndex] = target.dataset.goalQuery.split(":").map(Number);
    const row = state.diagnosisRows[rowIndex];
    if (row) {
      if (!Array.isArray(row.goals)) row.goals = row.goal ? [row.goal] : [];
      row.goals[goalIndex] = target.value;
      state.activeGoalSuggest = target.dataset.goalQuery;
      state.activeDiagnosisSuggest = null;
      render(`[data-goal-query="${target.dataset.goalQuery}"]`);
    }
    return;
  }

  if (target.dataset.ivCodeQuery) {
    const row = state.interventionRows[Number(target.dataset.ivCodeQuery)];
    if (row) {
      row.code = target.value;
      row.selected = true;
      const matched = findInterventionByCode(target.value);
      if (matched) row.content = matched.name;
      state.activeInterventionSuggest = matched ? null : `code:${target.dataset.ivCodeQuery}`;
      render(`[data-iv-code-query="${target.dataset.ivCodeQuery}"]`);
    }
    return;
  }

  if (target.dataset.ivContentQuery) {
    const row = state.interventionRows[Number(target.dataset.ivContentQuery)];
    if (row) {
      row.content = target.value;
      row.selected = true;
      const matched = findInterventionByName(target.value);
      if (matched) row.code = matched.code;
      state.activeInterventionSuggest = matched ? null : `content:${target.dataset.ivContentQuery}`;
      render(`[data-iv-content-query="${target.dataset.ivContentQuery}"]`);
    }
    return;
  }

  if (target.dataset.checklist) {
    state.assessmentChecklist[target.dataset.checklist] = target.value;
    if (target.dataset.checklist === "weight" || target.dataset.checklist === "height") {
      const weight = Number(state.assessmentChecklist.weight);
      const height = Number(state.assessmentChecklist.height);
      state.assessmentChecklist.bmi = weight > 0 && height > 0 ? (weight / (height / 100) ** 2).toFixed(1) : "";
      const bmiInput = app.querySelector('[data-checklist="bmi"]');
      if (bmiInput) bmiInput.value = state.assessmentChecklist.bmi;
    }
    if (target.dataset.checklist === "fluidIn" || target.dataset.checklist === "fluidOut") {
      updateFluidBalanceField();
    }
    return;
  }

  if (target.dataset.dxField) {
    const [index, key] = target.dataset.dxField.split(":");
    const row = state.diagnosisRows[Number(index)];
    if (row) {
      row[key] = target.value;
      if (key === "goal") row.goals = target.value ? [target.value] : [];
    }
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

  if (target.dataset.scaleCheck) {
    const scaleKey = target.dataset.scaleCheck;
    state.assessmentChecklist[scaleKey] = target.checked;
    if (target.checked) {
      const scale = getScaleForKey(scaleKey);
      if (scale) {
        state.activeScale = scaleKey;
        if (!state.scaleScores[scaleKey]) state.scaleScores[scaleKey] = {};
      }
    } else {
      delete state.scaleResults[scaleKey];
      delete state.scaleScores[scaleKey];
    }
    render();
    return;
  }

  if (target.dataset.checklistBool) {
    state.assessmentChecklist[target.dataset.checklistBool] = target.checked;
    render();
    return;
  }

  if (target.dataset.scaleItem) {
    const [scaleKey, itemKey] = target.dataset.scaleItem.split(":");
    if (!state.scaleScores[scaleKey]) state.scaleScores[scaleKey] = {};
    state.scaleScores[scaleKey][itemKey] = Number(target.value);
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
    const row = state.diagnosisRows[Number(target.dataset.dxSelected)];
    if (row) row.selected = target.checked;
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
    if (target.dataset.checklistRadio === "current_pain" && target.value !== "yes") {
      state.assessmentChecklist.pain_score = "";
      delete state.scaleResults.current_pain;
      delete state.scaleScores.current_pain;
    }
    if (target.dataset.checklistRadio === "allergy" && target.value !== "yes") {
      state.assessmentChecklist.allergy_note = "";
    }
    if (target.dataset.checklistRadio === "breathingMode" && target.value !== "Thở máy") {
      state.assessmentChecklist.ventilationAirway = [];
    }
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
    const [response, scaleResponse, assessmentResponse, interventionCodeResponse] = await Promise.all([
      fetch("./cd_deu_duong.json"),
      fetch("./thangdiem.json"),
      fetch("./nhan_dinh.json"),
      fetch("./ma_can_thiep.json"),
    ]);
    if (!response.ok) throw new Error(`Khong tai duoc cd_deu_duong.json (${response.status})`);
    state.raw = await response.json();
    state.data = deepFix(state.raw);
    if (scaleResponse.ok) {
      state.scaleData = await scaleResponse.json();
    }
    if (assessmentResponse.ok) {
      state.assessmentTemplate = deepFix(await assessmentResponse.json());
    }
    if (interventionCodeResponse.ok) {
      state.interventionCatalog = deepFix(await interventionCodeResponse.json());
    }
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
