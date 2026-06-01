const app = document.querySelector("#app");
let supabaseClient = null;
const VIETNAM_TIME_ZONE = "Asia/Ho_Chi_Minh";
const NANDA_LAST_DEPARTMENT_STORAGE_KEY = "nanda:lastDepartment";

function readStoredNandaDepartment() {
  try {
    return cleanLine(window.localStorage?.getItem(NANDA_LAST_DEPARTMENT_STORAGE_KEY) || "");
  } catch {
    return "";
  }
}

function writeStoredNandaDepartment(value) {
  const department = cleanLine(value);
  try {
    if (department) {
      window.localStorage?.setItem(NANDA_LAST_DEPARTMENT_STORAGE_KEY, department);
    } else {
      window.localStorage?.removeItem(NANDA_LAST_DEPARTMENT_STORAGE_KEY);
    }
  } catch {
    // Local storage can be unavailable in restricted browser modes.
  }
  return department;
}

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
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(text);
  if (dateOnly) {
    const date = new Date(`${text}T00:00:00+07:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const hasTimeZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(text);
  const normalized = hasTimeZone ? text : `${text.replace(" ", "T")}+07:00`;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatVietnamDate(value) {
  const date = value instanceof Date ? value : parseDateTimeForVietnam(value);
  if (!date) return value || "";
  const parts = vietnamDateParts(date);
  return `${parts.day}/${parts.month}/${parts.year}`;
}

function formatVietnamDateTime(value) {
  const date = value instanceof Date ? value : parseDateTimeForVietnam(value);
  if (!date) return value || "";
  const parts = vietnamDateParts(date);
  return `${parts.day}/${parts.month}/${parts.year} ${parts.hour}:${parts.minute}`;
}

function createDefaultHealthEducationForms() {
  const today = currentVietnamDateInput();
  return {
    admission: {
      date: today,
      staffName: "",
      patientSign: "",
      note: "",
      items: [
        { id: "1_1", content: "Hướng dẫn chế độ BHYT", need: "", result: "" },
        { id: "1_2", content: "Phổ biến nội quy, quy định của cơ sở khám bệnh, chữa bệnh. Hướng dẫn công tác kiểm soát nhiễm khuẩn: vệ sinh tay, phân loại rác thải đúng quy định.", need: "", result: "" },
        { id: "1_3", content: "Hướng dẫn sử dụng các trang thiết bị trong phòng bệnh: giường, gọi nhân viên y tế, sử dụng nhà vệ sinh...", need: "", result: "" },
        { id: "1_4", content: "Phổ biến các dịch vụ hiện có tại khoa: giường bệnh dịch vụ, các kỹ thuật mới trong công tác điều trị và chăm sóc...", need: "", result: "" },
        { id: "1_5", content: "Hướng dẫn chế độ ăn phù hợp với tình trạng bệnh và trước phẫu thuật", need: "", result: "" },
      ],
    },
    treatment: {
      date: today,
      staffName: "",
      patientSign: "",
      note: "",
      items: [
        { id: "2_1", content: "Giải thích các kỹ thuật, thủ thuật trước, trong và sau khi thực hiện trên người bệnh liên quan đến công tác chăm sóc.", need: "", result: "" },
        { id: "2_2", content: "Hướng dẫn sử dụng thuốc an toàn và hiệu quả.", need: "", result: "" },
        { id: "2_3", content: "Hướng dẫn tự phát hiện và theo dõi các triệu chứng khác thường", need: "", result: "" },
        { id: "2_4", content: "Hướng dẫn chế độ dinh dưỡng theo bệnh lý, tương tác giữa thực phẩm và thuốc (nếu có).", need: "", result: "" },
        { id: "2_5", content: "Hướng dẫn các vấn đề an toàn người bệnh: đề phòng té ngã, loét do tì đè.", need: "", result: "" },
        { id: "2_6", content: "Hướng dẫn chế độ vận động theo bệnh lý, nghỉ ngơi hợp lý.", need: "", result: "" },
        { id: "2_7", content: "Hướng dẫn chăm sóc vệ sinh cá nhân.", need: "", result: "" },
        { id: "2_8", content: "Tìm hiểu nhu cầu và hỗ trợ người bệnh giai đoạn cuối về thể chất - tinh thần.", need: "", result: "" },
      ],
    },
    discharge: {
      date: today,
      staffName: "",
      patientSign: "",
      note: "",
      items: [
        { id: "3_1", content: "Chăm sóc tại nhà sau khi xuất viện", need: "", result: "" },
        { id: "3_2", content: "Điều trị và dùng thuốc", need: "", result: "" },
        { id: "3_3", content: "Thời gian và nơi thực hiện việc theo dõi chăm sóc", need: "", result: "" },
        { id: "3_4", content: "Khi nào phải liên hệ với bác sĩ", need: "", result: "" },
        { id: "3_5", content: "Khi nào cần phải đi khám, chăm sóc khẩn cấp", need: "", result: "" },
      ],
    },
    summary: {
      note: "",
      items: [],
    },
  };
}

function createHandoverMedicineRow() {
  return {
    name: "",
    strength: "",
    dose: "",
    route: "",
    time: "",
    order: "",
  };
}

function createDefaultNandaForm() {
  return {
    khoa: "",
    nhom_van_de: "",
    van_de: "",
    nguyen_nhan: "",
    muc_tieu_can_thiep: "",
    ma_can_thiep: "",
    noi_dung_can_thiep: "",
  };
}

function normalizeHandoverMedicineRow(row = {}) {
  const { orderTime, note, ...current } = row;
  return {
    ...createHandoverMedicineRow(),
    ...current,
    time: row.time || row.orderTime || "",
    order: row.order || row.note || "",
  };
}

const state = {
  raw: null,
  data: null,
  screen: "patients",
  hasCareSheet: false,
  careSheets: [],
  careSheetsPatient: null,
  careSheetsLoadedFor: "",
  careSheetsLoading: false,
  careSheetsError: "",
  careListTab: "care",
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
    allergyDrug: "",
    allergyFood: "",
    allergyOther: "",
    allergySymptoms: "",
    fluidIn: "",
    fluidOut: "",
    fluidBalance: "",
    bodyType: "",
    consciousness: [],
    mucosa: [],
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
    coughStatus: [],
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
    circulationSymptoms: [],
    peripheralPerfusion: "",
    heartRhythm: "",
    heartRateStatus: "",
    heartSounds: "",
    circulationOtherChecked: false,
    circulationOther: "",
    abdomen: "",
    painLocation: [],
    painLocationOther: "",
    painCharacter: [],
    painCharacterOther: "",
    nauseaVomiting: [],
    nauseaVomitingOther: "",
    flatus: [],
    flatusOther: "",
    stool: [],
    stoolOther: "",
    urinary: [],
    urineAmount: "",
    nutritionRoute: [],
    nutritionRegimen: [],
    nutritionRegimenOther: "",
    pathologicalDiet: false,
    pathologicalDietTypes: [],
    pathologicalDietOther: "",
    neuroConsciousness: [],
    neuroConsciousnessOther: "",
    neuroOrientation: "",
    neuroOrientationOther: "",
    neuroBehaviorStatus: "",
    neuroBehavior: [],
    neuroBehaviorOther: "",
    neuroFocalSignsStatus: "",
    neuroFocalSigns: [],
    neuroFocalSignsOther: "",
    neuroSensory: "",
    mobilityAbility: [],
    mobilityAbilityOther: "",
    muscleStrength: [],
    muscleStrengthOther: "",
    movementStatus: [],
    movementStatusOther: "",
    mobilityRehab: "",
    treatmentEducation: [],
    careEducation: [],
    preventionEducation: [],
    healthEducation: "",
    healthEducationForms: createDefaultHealthEducationForms(),
    circulationNote: "",
    respiratoryNote: "",
    diseasedOrgan: "",
    fallRiskAssessment: false,
    vteRiskAssessment: false,
    painAssessment: false,
    pressureUlcerRiskAssessment: false,
    glasgowAssessment: false,
    obgynEnabled: false,
    obgynMode: "",
    handoverMedicineHalf: false,
    handoverMedicines: [],
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
  diagnosisSavedRows: [],
  diagnosisCatalog: [],
  diagnosisCatalogLoaded: false,
  diagnosisCatalogLoading: false,
  diagnosisCatalogError: "",
  diagnosisCatalogPromise: null,
  diagnosisCatalogSearchKey: "",
  diagnosisCatalogLastSearch: null,
  diagnosisCatalogSearchError: "",
  diagnosisPicker: null,
  diagnosisDetail: null,
  interventionRows: [],
  interventionDraft: { codeQuery: "", contentQuery: "", selected: [] },
  assessmentTemplate: null,
  obgynTemplate: null,
  scaleData: [],
  scaleScores: {},
  scaleResults: {},
  activeScale: null,
  activeFallRiskScalePicker: null,
  activeCareFormTab: "patient",
  activeDiagnosisSuggest: null,
  activeDiseasedOrganSuggest: false,
  diseasedOrganQuery: "",
  activeCauseSuggest: null,
  activeGoalSuggest: null,
  interventionCatalog: [],
  activeInterventionSuggest: null,
  healthEducationStage: "admission",
  activeHealthEducationStage: null,
  handoverMedicineModalOpen: false,
  handoverMedicineDraft: createHandoverMedicineRow(),
  openAssessmentCards: new Set(),
  problemCatalog: [],
  departmentCatalog: [],
  nandaRows: [],
  nandaLoaded: false,
  nandaLoading: false,
  nandaError: "",
  nandaSchemaSupportsDepartment: null,
  nandaSearch: "",
  nandaDepartmentFilter: "",
  nandaGroupFilter: "",
  nandaPage: 1,
  nandaExpandedDepartments: new Set(),
  nandaEditingId: null,
  nandaForm: createDefaultNandaForm(),
  nandaAutoFillText: "",
  nandaAutoFillRows: [],
  nandaAutoFillError: "",
  nandaLastDepartment: readStoredNandaDepartment(),
};

const initialAssessmentChecklist = JSON.parse(JSON.stringify(state.assessmentChecklist));

function createDefaultAssessmentChecklist() {
  return {
    ...JSON.parse(JSON.stringify(initialAssessmentChecklist)),
    evalTime: currentVietnamDateTimeInput(),
  };
}

function normalizeHandoverMedicines(checklist) {
  const rows = Array.isArray(checklist.handoverMedicines) ? checklist.handoverMedicines : [];
  checklist.handoverMedicines = rows.map((row) => normalizeHandoverMedicineRow(row || {}));
  return checklist;
}

function normalizeMultiChecklistFields(checklist) {
  ["consciousness", "mucosa", "coughStatus", "nutritionRoute", "neuroConsciousness"].forEach((key) => {
    const value = checklist[key];
    checklist[key] = Array.isArray(value) ? value : cleanLine(value) ? [value] : [];
  });
  const focalSigns = Array.isArray(checklist.neuroFocalSigns) ? [...checklist.neuroFocalSigns] : [];
  if (cleanLine(checklist.neuroFocalSignsStatus) && !focalSigns.includes(checklist.neuroFocalSignsStatus)) {
    focalSigns.unshift(checklist.neuroFocalSignsStatus);
  }
  checklist.neuroFocalSigns = focalSigns;
  checklist.neuroFocalSignsStatus = "";
  return checklist;
}

function latestPreviousChecklist() {
  return (state.careSheets || [])
    .map((sheet) => sheet?.nhan_dinh_json?.checklist)
    .find((checklist) => checklist && (cleanLine(checklist.height) || cleanLine(checklist.weight)));
}

function applyPreviousVitalsToChecklist(checklist) {
  const previous = latestPreviousChecklist();
  if (!previous) return checklist;
  if (!cleanLine(checklist.height) && cleanLine(previous.height)) checklist.height = previous.height;
  if (!cleanLine(checklist.weight) && cleanLine(previous.weight)) checklist.weight = previous.weight;
  checklist.fluidBalance = calculateFluidBalance(checklist.fluidIn, checklist.fluidOut);
  if (cleanLine(checklist.height) && cleanLine(checklist.weight)) {
    const weight = Number(checklist.weight);
    const height = Number(checklist.height);
    if (weight > 0 && height > 0) checklist.bmi = (weight / (height / 100) ** 2).toFixed(1);
  }
  return checklist;
}

function allergyDetailsFromChecklist(check) {
  const details = [
    ["Thuốc", check.allergyDrug],
    ["Thức ăn", check.allergyFood],
    ["Khác", check.allergyOther],
    ["Biểu hiện", check.allergySymptoms],
  ].filter(([, value]) => cleanLine(value));
  if (details.length) return details.map(([label, value]) => `${label}: ${value}`).join("; ");
  return check.allergy_note || "";
}

function clearAllergyDetails() {
  state.assessmentChecklist.allergy_note = "";
  state.assessmentChecklist.allergyDrug = "";
  state.assessmentChecklist.allergyFood = "";
  state.assessmentChecklist.allergyOther = "";
  state.assessmentChecklist.allergySymptoms = "";
}

const scaleMapping = {
  fallRiskAssessment: "morse_fall_scale",
  vteRiskAssessment: "vip_score",
  painAssessment: "vas_pain_score",
  current_pain: "vas_pain_score",
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

const OFRAS_SCALE = {
  id: "ofras_obstetric_fall_scale",
  name: "Thang điểm OFRAS (sản khoa)",
  totalScoreRule: "Cộng tổng điểm các tiêu chí được chọn; nếu có bất kỳ tiêu chí 3 điểm hoặc tổng điểm từ 5 trở lên là nguy cơ cao.",
  multiSelect: true,
  items: [
    {
      key: "prior_history",
      label: "Prior History (Tiền sử trước đây)",
      options: [
        { label: "Không có", score: 0 },
        { label: "Có sử dụng kính có gọng/kính áp tròng kê đơn, nhưng hiện tại không đeo", score: 1 },
        { label: "Có tiền sử nằm bất động tại giường (trong vòng 2 tháng qua)", score: 2 },
        { label: "Có tiền sử té ngã (ngay trước đó hoặc trong vòng 3 tháng qua)", score: 3 },
        { label: "Suy giảm thị lực nghiêm trọng (vượt quá mức có thể điều chỉnh bằng kính gọng hoặc kính áp tròng)", score: 3 },
      ],
    },
    {
      key: "cardiovascular",
      label: "Cardiovascular (Tim mạch)",
      options: [
        { label: "Không có", score: 0 },
        { label: "Chóng mặt", score: 2 },
        { label: "Có tiền sử thiếu máu và/hoặc tiền sản giật", score: 2 },
        { label: "Hạ huyết áp tư thế đứng", score: 3 },
      ],
    },
    {
      key: "hemorrhage",
      label: "Hemorrhage (Xuất huyết)",
      options: [
        { label: "Không có", score: 0 },
        { label: "Cắt tử cung", score: 2 },
        { label: "Được chẩn đoán nhau bong non hoặc nhau tiền đạo", score: 2 },
        { label: "Băng huyết sau sinh lớn hơn 500 ml", score: 3 },
      ],
    },
    {
      key: "anesthesia",
      label: "Anesthesia / Cognition (Gây tê / Nhận thức)",
      options: [
        { label: "Không gây tê ngoài màng cứng hoặc gây tê tủy sống", score: 0 },
        { label: "Tê bì ở vùng đùi", score: 2 },
        { label: "Hiện đang truyền thuốc gây tê ngoài màng cứng liên tục", score: 3 },
        { label: "Đã tắt/rút gây tê ngoài màng cứng chưa đầy 3 giờ", score: 3 },
        { label: "Gây tê tủy sống trong vòng 12 giờ đầu tiên", score: 3 },
        { label: "Biến đổi nhận thức / Suy giảm nhận thức", score: 3 },
      ],
    },
    {
      key: "motor",
      label: "Motor / Activity (Vận động / Hoạt động)",
      options: [
        { label: "Có thể cử động chân - tự đi lại độc lập", score: 0 },
        { label: "Có thể cử động chân - đi lại cần dụng cụ hỗ trợ (ví dụ: khung tập đi, gậy...)", score: 1 },
        { label: "Có thể nhấc thẳng chân (SLR) nhưng không thể làm động tác cầu bập bênh", score: 2 },
        { label: "Không thể nhấc thẳng chân (SLR)", score: 3 },
      ],
    },
  ],
  riskInterpretation: [
    { min: 0, max: 2, risk: "Nguy cơ thấp" },
    { min: 3, max: 4, risk: "Nguy cơ trung bình" },
    { min: 5, max: 99, risk: "Nguy cơ cao" },
  ],
};

const HUMPTY_DUMPTY_SCALE = {
  id: "humpty_dumpty_fall_scale",
  name: "Thang điểm Humpty Dumpty (Trẻ em)",
  totalScoreRule: "Cộng tổng điểm 7 nhóm tiêu chí. 7-11 điểm: nguy cơ thấp; 12-23 điểm: nguy cơ cao.",
  items: [
    {
      key: "age",
      label: "Tuổi",
      options: [
        { label: "< 3 tuổi", score: 4 },
        { label: "3 tuổi đến < 7 tuổi", score: 3 },
        { label: "7 tuổi đến < 13 tuổi", score: 2 },
        { label: "≥ 13 tuổi", score: 1 },
      ],
    },
    {
      key: "gender",
      label: "Giới tính",
      options: [
        { label: "Nam", score: 2 },
        { label: "Nữ", score: 1 },
      ],
    },
    {
      key: "diagnosis",
      label: "Chẩn đoán",
      options: [
        { label: "Chẩn đoán thần kinh", score: 4 },
        { label: "Suy giảm thể trạng/thay đổi oxy hóa", score: 3 },
        { label: "Tâm thần/hành vi", score: 2 },
        { label: "Chẩn đoán khác", score: 1 },
      ],
    },
    {
      key: "cognition",
      label: "Suy giảm nhận thức",
      options: [
        { label: "Không nhận biết được giới hạn bản thân", score: 3 },
        { label: "Hay quên các giới hạn của bản thân", score: 2 },
        { label: "Định hướng phù hợp với khả năng của bản thân", score: 1 },
      ],
    },
    {
      key: "environment",
      label: "Yếu tố môi trường",
      options: [
        { label: "Tiền sử té ngã; trẻ nhũ nhi/trẻ mới biết đi được đặt trên giường", score: 4 },
        { label: "Sử dụng dụng cụ hỗ trợ; trẻ nằm trong cũi", score: 3 },
        { label: "Người bệnh được đặt trên giường", score: 2 },
        { label: "Khu vực ngoại trú", score: 1 },
      ],
    },
    {
      key: "anesthesia",
      label: "Người bệnh đã phẫu thuật/an thần sâu",
      options: [
        { label: "Trong vòng 24 giờ", score: 3 },
        { label: "Trong vòng 48 giờ", score: 2 },
        { label: "Trên 48 giờ/không có", score: 1 },
      ],
    },
    {
      key: "medication",
      label: "Sử dụng thuốc",
      options: [
        { label: "Sử dụng nhiều thuốc nguy cơ: an thần, thuốc ngủ, barbiturat, chống trầm cảm, nhuận tràng, lợi tiểu, opioid", score: 3 },
        { label: "Sử dụng một trong các thuốc nêu trên", score: 2 },
        { label: "Thuốc khác/không dùng thuốc", score: 1 },
      ],
    },
  ],
  riskInterpretation: [
    { min: 7, max: 11, risk: "Nguy cơ thấp" },
    { min: 12, max: 23, risk: "Nguy cơ cao" },
  ],
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
    causeQuery: "",
    goalQuery: "",
    goals: [],
    diagnosisIds: [],
    causes: [],
  };
}

function normalizeDiagnosisRowForSave(row) {
  return {
    id: row.id || `dx-saved-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    selected: true,
    diagnosis: cleanLine(row.diagnosis),
    diagnosisQuery: cleanLine(row.diagnosis),
    causeQuery: "",
    goalQuery: "",
    goals: (Array.isArray(row.goals) ? row.goals : row.goal ? [row.goal] : [])
      .map(cleanLine)
      .filter(Boolean)
      .filter((value, index, values) => values.indexOf(value) === index),
    diagnosisIds: Array.isArray(row.diagnosisIds) ? row.diagnosisIds.map(String) : [],
    causes: (Array.isArray(row.causes) ? row.causes : []).map(cleanLine).filter(Boolean),
  };
}

function hasCompleteDiagnosisDraft(row) {
  const saved = normalizeDiagnosisRowForSave(row || {});
  return Boolean(saved.diagnosis && saved.causes.length && saved.goals.length);
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
    .replace(/[\u0111\u0110]/g, "d")
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

function diagnosisCatalogRows() {
  return Array.isArray(state.diagnosisCatalog) ? state.diagnosisCatalog : [];
}

function splitCatalogList(value) {
  return String(value || "")
    .split(";")
    .map(cleanLine)
    .filter(Boolean);
}

function catalogField(item, exactKey, fallbackKeys = []) {
  const entries = Object.entries(item || {});
  const keySearch = (key) => searchKey(String(key || "").replace(/[_-]+/g, " "));
  const exact = entries.find(([key]) => keySearch(key) === exactKey);
  if (exact) return exact[1];
  for (const fallback of fallbackKeys) {
    const match = entries.find(([key]) => keySearch(key).includes(fallback));
    if (match) return match[1];
  }
  return "";
}

function normalizeDiagnosisCatalogRow(item, index) {
  const codes = splitCatalogList(catalogField(item, "ma can thiep") || item.ma_can_thiep || item.code || item.interventionCode);
  const names = splitCatalogList(catalogField(item, "can thiep") || item.can_thiep || item.name || item.intervention);
  const fullItems = splitCatalogList(catalogField(item, "full ma va can thiep", ["full ma"]) || item.full_ma_va_can_thiep);
  const interventions = [];
  const maxLength = Math.max(codes.length, names.length, fullItems.length);
  for (let idx = 0; idx < maxLength; idx += 1) {
    let code = codes[idx] || "";
    let name = names[idx] || "";
    const full = fullItems[idx] || "";
    if ((!code || !name) && full) {
      const match = full.match(/^\s*([^-]+?)\s*-\s*(.+)$/);
      if (match) {
        code = code || cleanLine(match[1]);
        name = name || cleanLine(match[2]);
      } else {
        name = name || full;
      }
    }
    if (code || name) interventions.push({ code, name });
  }
  return {
    id: String(item.STT ?? item.id ?? index + 1),
    group: cleanLine(item.nhom_benh || catalogField(item, "nhom benh") || item.group || item.category),
    nanda: cleanLine(item.chan_doan || catalogField(item, "chan doan") || catalogField(item, "nhan dinh") || item.nanda || item.diagnosis),
    cause: cleanLine(item.nguyen_nhan || catalogField(item, "nguyen nhan") || item.cause),
    noc: cleanLine(item.muc_tieu || catalogField(item, "muc tieu") || item.noc || item.goal),
    nic: fullItems.join("; "),
    interventionCodes: codes,
    interventionNames: names,
    interventions,
    raw: item,
  };
}

function normalizeDiagnosisCatalog(data) {
  const rows = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
  return rows.map(normalizeDiagnosisCatalogRow).filter((item) => item.nanda);
}

function mergeDiagnosisCatalogRows(rows) {
  const current = diagnosisCatalogRows();
  const grouped = new Map(current.map((item) => [`${item.id}|${item.nanda}|${item.cause}|${item.noc}`, item]));
  for (const item of normalizeDiagnosisCatalog(deepFix(rows))) {
    grouped.set(`${item.id}|${item.nanda}|${item.cause}|${item.noc}`, item);
  }
  state.diagnosisCatalog = [...grouped.values()];
  return state.diagnosisCatalog;
}

function supabaseSearchValue(value) {
  return cleanLine(value)
    .replace(/[%,()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function diagnosisCatalogSearchFilter(query, mode = "diagnosis") {
  const value = supabaseSearchValue(query);
  if (!value) return "";
  const pattern = `*${value}*`;
  if (mode === "intervention") {
    return [
      `ma_can_thiep.ilike.${pattern}`,
      `can_thiep.ilike.${pattern}`,
      `full_ma_va_can_thiep.ilike.${pattern}`,
    ].join(",");
  }
  if (mode === "cause") {
    return [
      `nguyen_nhan.ilike.${pattern}`,
      `chan_doan.ilike.${pattern}`,
      `nhom_benh.ilike.${pattern}`,
    ].join(",");
  }
  return [
    `nhom_benh.ilike.${pattern}`,
    `chan_doan.ilike.${pattern}`,
  ].join(",");
}

async function fetchDiagnosisCatalogFromSupabase(query, mode = "diagnosis") {
  const filter = diagnosisCatalogSearchFilter(query, mode);
  if (!filter) return [];
  const { data, error } = await getSupabaseClient()
    .from("nanda_nic_noc_dataset")
    .select("*")
    .or(filter)
    .limit(120);
  if (error) throw new Error(`Không tải được bảng nanda_nic_noc_dataset: ${error.message}`);
  return mergeDiagnosisCatalogRows(data || []);
}

function requestDiagnosisCatalogSearch(query, mode = "diagnosis") {
  const value = supabaseSearchValue(query);
  if (value.length < 2) return Promise.resolve(diagnosisCatalogRows());
  const requestKey = `${mode}:${searchKey(value)}`;
  if (state.diagnosisCatalogLoading && state.diagnosisCatalogSearchKey === requestKey && state.diagnosisCatalogPromise) {
    return state.diagnosisCatalogPromise;
  }

  state.diagnosisCatalogLoading = true;
  state.diagnosisCatalogError = "";
  state.diagnosisCatalogSearchError = "";
  state.diagnosisCatalogSearchKey = requestKey;
  state.diagnosisCatalogLastSearch = { query: value, mode };
  state.diagnosisCatalogPromise = fetchDiagnosisCatalogFromSupabase(value, mode)
    .then((catalog) => {
      state.diagnosisCatalogLoaded = true;
      return catalog;
    })
    .catch((error) => {
      state.diagnosisCatalogSearchError = error.message || String(error);
      state.diagnosisCatalogError = state.diagnosisCatalogSearchError;
      return diagnosisCatalogRows();
    })
    .finally(() => {
      state.diagnosisCatalogLoading = false;
      state.diagnosisCatalogPromise = null;
      render(activeCareInputSelector());
    });

  return state.diagnosisCatalogPromise;
}

async function loadDiagnosisCatalogFromSupabase() {
  const client = getSupabaseClient();
  const pageSize = 1000;
  let from = 0;
  const rows = [];

  while (true) {
    const to = from + pageSize - 1;
    const { data, error } = await client
      .from("nanda_nic_noc_dataset")
      .select("*")
      .range(from, to);

    if (error) {
      throw new Error(`Không tải được bảng nanda_nic_noc_dataset: ${error.message}`);
    }

    const page = Array.isArray(data) ? data : [];
    rows.push(...page);
    if (page.length < pageSize) break;
    from += pageSize;
  }

  return normalizeDiagnosisCatalog(deepFix(rows));
}

function ensureDiagnosisCatalogLoaded({ renderOnComplete = true } = {}) {
  if (state.diagnosisCatalogLoaded) return Promise.resolve(state.diagnosisCatalog);
  if (state.diagnosisCatalogLoading && state.diagnosisCatalogPromise) return state.diagnosisCatalogPromise;

  state.diagnosisCatalogLoading = true;
  state.diagnosisCatalogError = "";
  state.diagnosisCatalogPromise = loadDiagnosisCatalogFromSupabase()
    .then((catalog) => {
      state.diagnosisCatalog = catalog;
      state.diagnosisCatalogLoaded = true;
      return catalog;
    })
    .catch((error) => {
      state.diagnosisCatalogError = error.message || String(error);
      return [];
    })
    .finally(() => {
      state.diagnosisCatalogLoading = false;
      state.diagnosisCatalogPromise = null;
      if (renderOnComplete) render(activeCareInputSelector());
    });

  return state.diagnosisCatalogPromise;
}

function renderDiagnosisCatalogStatus() {
  if (!state.diagnosisCatalogError) {
    return `<div class="empty care-list-empty">Đang tải dữ liệu NANDA/NIC/NOC từ Supabase...</div>`;
  }
  return `
    <div class="empty care-list-empty">
      <strong>Không tải được dữ liệu NANDA/NIC/NOC.</strong>
      <p>${h(state.diagnosisCatalogError)}</p>
      <button type="button" class="btn primary" data-action="retry-diagnosis-catalog">Tải lại</button>
    </div>
  `;
}

function nandaCatalogOptions(query = "") {
  const key = searchKey(query);
  const grouped = new Map();
  for (const item of diagnosisCatalogRows()) {
    const group = cleanLine(item.group);
    for (const nanda of splitSuggestionLines(item.nanda)) {
      if (key && !searchKey(`${group} ${nanda} ${item.id}`).includes(key)) continue;
      if (!grouped.has(nanda)) grouped.set(nanda, { nanda, group, ids: [], rows: [] });
      if (group && !grouped.get(nanda).group) grouped.get(nanda).group = group;
      grouped.get(nanda).ids.push(item.id);
      grouped.get(nanda).rows.push(item);
    }
  }
  return [...grouped.values()].slice(0, 80);
}

function diseasedOrganSelectedItems() {
  return String(state.assessmentChecklist.diseasedOrgan || "")
    .split(";")
    .map(cleanLine)
    .filter(Boolean);
}

function setDiseasedOrganSelectedItems(items) {
  state.assessmentChecklist.diseasedOrgan = [...new Set(items.map(cleanLine).filter(Boolean))].join("; ");
}

function splitSuggestionLines(value) {
  return String(value || "")
    .split(";")
    .map(cleanLine)
    .filter(Boolean);
}

function renderSuggestionLines(value, tag = "em") {
  const safeTag = tag === "strong" ? "strong" : "em";
  const lines = splitSuggestionLines(value);
  return lines.map((line) => `<${safeTag}>${h(line)}</${safeTag}>`).join("");
}

function catalogValueHasLine(value, line) {
  const key = searchKey(line);
  return Boolean(key) && splitSuggestionLines(value).some((item) => searchKey(item) === key);
}

function addCustomDiseasedOrgan(value = state.diseasedOrganQuery) {
  const values = diseasedOrganSelectedItems();
  const customValue = cleanLine(value);
  if (customValue && !values.some((item) => searchKey(item) === searchKey(customValue))) {
    values.push(customValue);
    setDiseasedOrganSelectedItems(values);
  }
  state.diseasedOrganQuery = "";
  state.activeDiseasedOrganSuggest = false;
}

function diseasedOrganOptions(query = "") {
  const key = searchKey(query);
  const grouped = new Map();
  for (const item of diagnosisCatalogRows()) {
    const cause = cleanLine(item.cause);
    const nanda = cleanLine(item.nanda);
    if (!nanda) continue;
    if (key && !searchKey(cause).includes(key)) continue;
    if (!grouped.has(nanda)) grouped.set(nanda, { nanda, causes: [] });
    if (cause && !grouped.get(nanda).causes.includes(cause)) grouped.get(nanda).causes.push(cause);
  }
  return [...grouped.values()].slice(0, 12);
}

function nandaCatalogOptionByName(nanda) {
  const name = cleanLine(nanda);
  if (!name) return null;
  const rows = diagnosisCatalogRows().filter((item) => catalogValueHasLine(item.nanda, name));
  if (!rows.length) return null;
  return {
    nanda: name,
    ids: rows.map((item) => item.id),
    rows,
  };
}

function applyNandaCatalogSelection(row, nanda) {
  if (!row) return;
  const option = nandaCatalogOptionByName(nanda);
  row.diagnosis = cleanLine(nanda);
  row.diagnosisQuery = row.diagnosis;
  row.diagnosisIds = option ? option.ids.map(String) : [];
  row.causes = (row.causes || []).filter((cause) =>
    causeOptionsForDiagnosis(row).some((item) => item.cause === cause),
  );
  row.goals = (row.goals || []).filter((goal) =>
    goalOptionsForDiagnosisRow(row).includes(goal),
  );
}

function selectedNandasForRow(row) {
  const selected = new Set((row?.diagnosisIds || []).map(String));
  return [...new Set(
    diagnosisCatalogRows()
      .filter((item) => selected.has(String(item.id)))
      .flatMap((item) => splitSuggestionLines(item.nanda))
      .filter((nanda) => !row?.diagnosis || searchKey(nanda) === searchKey(row.diagnosis))
      .filter(Boolean),
  )];
}

function syncDiagnosisFromSelectedIds(row) {
  if (!row) return;
  row.diagnosis = selectedNandasForRow(row).join("; ");
  row.causes = (row.causes || []).filter((cause) =>
    causeOptionsForDiagnosis(row).some((item) => item.cause === cause),
  );
  row.goals = (row.goals || []).filter((goal) =>
    goalOptionsForDiagnosisRow(row).includes(goal),
  );
}

function toggleNandaCatalogSelection(row, nanda, checked) {
  if (!row) return;
  const option = nandaCatalogOptionByName(nanda);
  if (!option) return;
  row.diagnosisIds = checked ? option.ids.map(String) : [];
  row.diagnosis = checked ? option.nanda : "";
  row.diagnosisQuery = row.diagnosis;
  row.causes = [];
  row.goals = [];
  row.causeQuery = "";
  row.goalQuery = "";
}

function diagnosisRowsForSelectedNanda(row) {
  const selected = new Set(row.diagnosisIds || []);
  const selectedNandas = new Set(
    diagnosisCatalogRows()
      .filter((item) => selected.has(String(item.id)) || selected.has(item.id))
      .flatMap((item) => splitSuggestionLines(item.nanda)),
  );
  if (!selectedNandas.size && row.diagnosis) selectedNandas.add(row.diagnosis);
  return diagnosisCatalogRows().filter((item) =>
    splitSuggestionLines(item.nanda).some((nanda) => selectedNandas.has(nanda)),
  );
}

function causeOptionsForDiagnosis(row) {
  const grouped = new Map();
  for (const item of diagnosisRowsForSelectedNanda(row)) {
    for (const cause of splitSuggestionLines(item.cause)) {
      if (!grouped.has(cause)) grouped.set(cause, { cause, ids: [] });
      grouped.get(cause).ids.push(item.id);
    }
  }
  return [...grouped.values()];
}

function selectedDiagnosisRecords(row, options = {}) {
  const selectedCauses = new Set(row.causes || []);
  const selectedGoals = new Set(row.goals || []);
  const candidates = diagnosisRowsForSelectedNanda(row);
  return candidates.filter((item) => {
    if (selectedCauses.size && !splitSuggestionLines(item.cause).some((cause) => selectedCauses.has(cause))) return false;
    if (options.filterGoals && selectedGoals.size) {
      const goals = splitCatalogList(item.noc);
      return goals.some((goal) => selectedGoals.has(goal));
    }
    return true;
  });
}

function goalOptionsForDiagnosisRow(row) {
  return [...new Set(
    selectedDiagnosisRecords(row)
      .flatMap((item) => String(item.noc || "").split(";"))
      .map(cleanLine)
      .filter(Boolean),
  )];
}

function filteredCauseOptionsForDiagnosis(row) {
  const key = searchKey(row.causeQuery);
  return causeOptionsForDiagnosis(row).filter((item) => !key || searchKey(item.cause).includes(key));
}

function filteredGoalOptionsForDiagnosis(row) {
  const key = searchKey(row.goalQuery);
  return goalOptionsForDiagnosisRow(row).filter((goal) => !key || searchKey(goal).includes(key));
}

function diagnosisCodeSummary(row) {
  return selectedDiagnosisRecords(row)
    .map((item) => item.id)
    .filter((value, index, values) => values.indexOf(value) === index)
    .slice(0, 12)
    .join(", ");
}

function diagnosisDetailText(row) {
  return selectedDiagnosisRecords(row)
    .slice(0, 10)
    .map((item) => [
      `Mã: ${item.id}`,
      `Chẩn đoán: ${cleanLine(item.nanda)}`,
      `Nguyên nhân: ${cleanLine(item.cause) || "-"}`,
      `Mục tiêu/NOC: ${cleanLine(item.noc) || "-"}`,
      `Can thiệp/NIC: ${cleanLine(item.nic) || "-"}`,
    ].join("\n"))
    .join("\n\n");
}

function interventionCatalogItems() {
  const grouped = new Map();
  for (const item of interventionCodeCatalogItems()) {
    const key = interventionOptionKey(item);
    if ((item.code || item.name) && !grouped.has(key)) grouped.set(key, item);
  }
  for (const item of careNandaRows().flatMap((row) => completedNandaInterventionRows(row))) {
    const option = {
      code: cleanLine(item.code),
      name: cleanLine(item.content || item.name),
    };
    const key = interventionOptionKey(option);
    if ((option.code || option.name) && !grouped.has(key)) grouped.set(key, option);
  }
  for (const record of diagnosisCatalogRows()) {
    for (const item of record.interventions || []) {
      const option = {
        code: cleanLine(item.code),
        name: cleanLine(item.name),
        group: cleanLine(record.nanda),
      };
      const key = interventionOptionKey(option);
      if ((option.code || option.name) && !grouped.has(key)) grouped.set(key, option);
    }
  }
  return [...grouped.values()];
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

function createInterventionDraft() {
  return { codeQuery: "", contentQuery: "", selected: [] };
}

function interventionOptionKey(item) {
  return `${cleanLine(item.code)}|${cleanLine(item.name || item.content)}`;
}

function keywordTokens(text) {
  const stopWords = new Set([
    "va", "voi", "cho", "theo", "khi", "neu", "cac", "cua", "nguoi", "benh", "dieu", "duong",
    "cham", "soc", "can", "thiep", "huong", "dan", "the", "tinh", "trang", "lien", "quan",
  ]);
  return [...new Set(
    searchKey(text)
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .map((token) => token.trim())
      .filter((token) => token.length >= 3 && !stopWords.has(token)),
  )];
}

function interventionMatchScore(catalogItem, sourceText) {
  const catalog = searchKey(`${catalogItem.code} ${catalogItem.name}`);
  const source = searchKey(sourceText);
  if (!catalog || !source) return 0;
  if (source.includes(searchKey(catalogItem.name)) || catalog.includes(source)) return 100;
  const sourceTokens = keywordTokens(source);
  if (!sourceTokens.length) return 0;
  return sourceTokens.reduce((score, token) => score + (catalog.includes(token) ? 1 : 0), 0);
}

function savedDiagnosisInterventionRecords() {
  const rows = state.diagnosisSavedRows || [];
  return rows.flatMap((row) =>
    selectedDiagnosisRecords(row, { filterGoals: true }),
  );
}

function diagnosisBasedInterventionOptions() {
  const grouped = new Map();
  for (const record of savedDiagnosisInterventionRecords()) {
    for (const item of record.interventions || []) {
      const option = {
        code: cleanLine(item.code),
        name: cleanLine(item.name),
        group: "Gợi ý theo chẩn đoán",
      };
      const key = interventionOptionKey(option);
      if ((option.code || option.name) && !grouped.has(key)) grouped.set(key, option);
    }
  }
  return [...grouped.values()];
}

function interventionDropdownOptions(value, mode) {
  const query = searchKey(value);
  const diagnosisOptions = diagnosisBasedInterventionOptions();
  const source = query ? [...diagnosisOptions, ...interventionCatalogItems()] : (diagnosisOptions.length ? diagnosisOptions : interventionCatalogItems());
  const grouped = new Map();
  for (const item of source) {
    const target = mode === "code" ? item.code : item.name;
    if (query && !searchKey(target).includes(query)) continue;
    if (!grouped.has(interventionOptionKey(item))) grouped.set(interventionOptionKey(item), item);
    if (grouped.size >= 40) break;
  }
  return [...grouped.values()].slice(0, 12);
}

function isInterventionDraftSelected(item) {
  return (state.interventionDraft.selected || []).some((selected) => interventionOptionKey(selected) === interventionOptionKey(item));
}

function toggleInterventionDraftSelection(item, checked) {
  const draft = state.interventionDraft || createInterventionDraft();
  const selected = Array.isArray(draft.selected) ? [...draft.selected] : [];
  const key = interventionOptionKey(item);
  const index = selected.findIndex((entry) => interventionOptionKey(entry) === key);
  if (checked && index < 0) selected.push({ code: cleanLine(item.code), content: cleanLine(item.name || item.content) });
  if (!checked && index >= 0) selected.splice(index, 1);
  state.interventionDraft = { ...draft, selected };
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
    state.assessmentChecklist = applyPreviousVitalsToChecklist(createDefaultAssessmentChecklist());
    state.patient = defaultCarePatientState();
  state.scaleScores = {};
  state.scaleResults = {};
  state.activeScale = null;
  state.activeFallRiskScalePicker = null;
  }
  state.selectedAssessments = new Set();
  state.assessmentEdits = {};
  state.diagnosisRows = [createDiagnosisRow()];
  state.diagnosisSavedRows = [];
  state.interventionRows = [];
  state.interventionDraft = createInterventionDraft();
  state.activeDiagnosisSuggest = null;
  state.activeCauseSuggest = null;
  state.activeGoalSuggest = null;
  state.activeInterventionSuggest = null;
  state.activeCareFormTab = "patient";
  state.openAssessmentCards = new Set();
  state.handoverMedicineModalOpen = false;
  state.handoverMedicineDraft = createHandoverMedicineRow();
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
  normalizeMultiChecklistFields(state.assessmentChecklist);
  normalizeHandoverMedicines(state.assessmentChecklist);
  if (!Array.isArray(state.assessmentChecklist.stool) && state.assessmentChecklist.stool) {
    const legacyStoolValues = {
      "Bình thường": "Bình thường",
      "Lỏng": "Phân lỏng",
      "Táo": "Táo bón",
      "Không đại tiện": "Chưa đại tiện",
    };
    state.assessmentChecklist.stool = [legacyStoolValues[state.assessmentChecklist.stool] || state.assessmentChecklist.stool];
  }
  state.assessmentChecklist.fluidBalance = calculateFluidBalance(
    state.assessmentChecklist.fluidIn,
    state.assessmentChecklist.fluidOut,
  );
  state.scaleResults = sheet.thang_diem_json || {};
  state.activeScale = null;
  state.activeFallRiskScalePicker = null;
  state.selectedAssessments = new Set();
  state.assessmentEdits = {};
  state.activeDiagnosisSuggest = null;
  state.activeCauseSuggest = null;
  state.activeGoalSuggest = null;
  state.activeInterventionSuggest = null;
  state.handoverMedicineModalOpen = false;
  state.handoverMedicineDraft = createHandoverMedicineRow();
  state.diagnosisSavedRows = diagnoses.length
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
          causeQuery: "",
          goalQuery: "",
          goals,
          diagnosisIds: String(item.code || "")
            .split(",")
            .map((value) => cleanLine(value))
            .filter(Boolean),
          causes: Array.isArray(item.causes) ? item.causes : [],
        };
      })
    : [];
  state.diagnosisRows = [createDiagnosisRow()];
  state.interventionRows = interventions.map((item, index) => ({
    id: `iv-edit-${sheet.id}-${index}`,
    selected: true,
    code: item.code || "",
    content: item.content || "",
  }));
  if (state.careSheetsPatient) {
    state.patient = {
      ...state.patient,
      name: state.careSheetsPatient.ho_ten || state.patient.name,
      code: state.careSheetsPatient.ma_benh_nhan || state.patient.code,
      age: state.careSheetsPatient.tuoi || state.patient.age,
      sex: state.careSheetsPatient.gioi_tinh || state.patient.sex,
      room: state.careSheetsPatient.phong || state.patient.room,
      bed: state.careSheetsPatient.giuong || state.patient.bed,
      department: state.careSheetsPatient.khoa || state.patient.department,
    };
  }
  state.interventionDraft = createInterventionDraft();
  state.screen = "careForm";
  render();
}

function startHomeCareTest(activeTab = "patient", activeScale = "") {
  state.careSheets = [];
  state.careSheetsPatient = null;
  state.careSheetsLoadedFor = "";
  state.careSheetsError = "";
  state.careGoalEvaluations = [];
  state.careGoalEvaluationsLoadedFor = "";
  state.careGoalEvaluationsError = "";
  state.editingCareSheetId = null;
  state.selectedCareSheetId = null;
  state.hasCareSheet = true;
  resetCareFormState({ resetChecklist: true });
  state.activeCareFormTab = activeTab;
  if (activeScale) {
    state.assessmentChecklist[activeScale] = true;
    state.activeScale = activeScale;
    if (!state.scaleScores[activeScale]) state.scaleScores[activeScale] = {};
  }
  state.screen = "careForm";
  render();
}

function startStandaloneScale(scaleKey) {
  resetCareFormState({ resetChecklist: true });
  state.hasCareSheet = true;
  state.activeCareFormTab = "assessment";
  state.assessmentChecklist[scaleKey] = true;
  if (isFallRiskScaleKey(scaleKey)) {
    openFallRiskScalePicker(scaleKey);
  } else {
    state.activeScale = scaleKey;
    if (!state.scaleScores[scaleKey]) state.scaleScores[scaleKey] = {};
  }
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

function currentCarePatientInfo() {
  const selected = patients[state.selectedPatientIndex] || patients[0] || {};
  const department = state.data ? currentDepartment() : {};
  const condition = state.data ? currentCondition() : {};
  const previous = state.careSheetsPatient || {};
  return {
    name: cleanLine(state.patient.name) || previous.ho_ten || selected.name || "",
    code: cleanLine(state.patient.code) || previous.ma_benh_nhan || selected.code || "",
    age: cleanLine(state.patient.age) || previous.tuoi || selected.age || "",
    sex: cleanLine(state.patient.sex) || previous.gioi_tinh || selected.sex || "",
    room: cleanLine(state.patient.room) || previous.phong || selected.room || "",
    bed: cleanLine(state.patient.bed) || previous.giuong || selected.bed || "",
    department: cleanLine(state.patient.department) || previous.khoa || selected.department || department.ten_khoa || "",
    diagnosis: cleanLine(state.patient.diagnosis) || condition.ten_mat_benh || "",
    date: cleanLine(state.patient.date) || currentVietnamDateInput(),
  };
}

function defaultCarePatientState() {
  const selected = patients[state.selectedPatientIndex] || patients[0] || {};
  const department = state.data ? currentDepartment() : {};
  const condition = state.data ? currentCondition() : {};
  return {
    name: selected.name || "",
    code: selected.code || "",
    age: selected.age || "",
    sex: selected.sex || "",
    room: selected.room || "",
    bed: selected.bed || "",
    department: selected.department || department.ten_khoa || "",
    diagnosis: condition.ten_mat_benh || "",
    date: currentVietnamDateInput(),
  };
}

function fluidBalanceFromChecklist(check) {
  const calculated = calculateFluidBalance(check.fluidIn, check.fluidOut);
  return calculated !== "" ? calculated : check.fluidBalance;
}

function inputNextAttrs(type = "text") {
  const inputMode = type === "number" ? ' inputmode="decimal"' : "";
  return `enterkeyhint="next" autocomplete="off" autocapitalize="sentences"${inputMode}`;
}

function activeCareInputSelector() {
  const active = document.activeElement;
  if (!active || !app.contains(active) || !active.closest(".form-mode")) return "";
  const attributes = [
    "data-input",
    "data-patient",
    "data-assessment-edit",
    "data-gdsk-note",
    "data-gdsk-meta",
    "data-checklist",
    "data-dx-query",
    "data-dx-cause-query",
    "data-dx-goal-query",
    "data-diseased-organ-query",
    "data-dx-picker-query",
    "data-goal-query",
    "data-iv-code-query",
    "data-iv-content-query",
    "data-handover-medicine-draft",
    "data-dx-field",
    "data-iv-field",
  ];
  const attribute = attributes.find((name) => active.hasAttribute(name));
  if (!attribute) return "";
  const value = active.getAttribute(attribute);
  if (!value) return `[${attribute}]`;
  const escapedValue = typeof CSS !== "undefined" && typeof CSS.escape === "function"
    ? CSS.escape(value)
    : value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `[${attribute}="${escapedValue}"]`;
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

function normalizeNandaPayload(form = {}) {
  return {
    khoa: cleanLine(form.khoa),
    nhom_van_de: cleanLine(form.nhom_van_de),
    van_de: cleanLine(form.van_de),
    nguyen_nhan: cleanLine(form.nguyen_nhan),
    muc_tieu_can_thiep: cleanLine(form.muc_tieu_can_thiep),
    ma_can_thiep: cleanLine(form.ma_can_thiep),
    noi_dung_can_thiep: cleanLine(form.noi_dung_can_thiep),
  };
}

function nandaMatchesSearch(row, query) {
  const value = searchKey(query);
  if (!value) return true;
  return [
    row.khoa,
    row.nhom_van_de,
    row.van_de,
    row.nguyen_nhan,
    row.muc_tieu_can_thiep,
    row.ma_can_thiep,
    row.noi_dung_can_thiep,
  ].some((text) => searchKey(text).includes(value));
}

function formatNandaDiagnosis(row = {}) {
  const problem = cleanLine(row.van_de);
  const cause = cleanLine(row.nguyen_nhan);
  if (!problem) return "";
  if (!cause) return problem;
  return `${problem} liên quan đến ${cause.charAt(0).toLowerCase()}${cause.slice(1)}`;
}

function filteredNandaRows() {
  const groupFilter = searchKey(state.nandaGroupFilter);
  const departmentFilter = searchKey(state.nandaDepartmentFilter);
  return state.nandaRows.filter((row) => {
    if (departmentFilter && searchKey(row.khoa) !== departmentFilter) return false;
    if (groupFilter && searchKey(row.nhom_van_de) !== groupFilter) return false;
    return nandaMatchesSearch(row, state.nandaSearch);
  });
}

const NANDA_ROWS_PER_PAGE = 5;

function nandaEnteredDepartmentOptions() {
  return uniqueCleanValues(state.nandaRows.map((row) => row.khoa));
}

function nandaEnteredGroupOptions() {
  return uniqueCleanValues(state.nandaRows.map((row) => row.nhom_van_de));
}

function nandaPageCount(rowCount) {
  return Math.max(1, Math.ceil(rowCount / NANDA_ROWS_PER_PAGE));
}

function clampNandaPage(rowCount) {
  const pageCount = nandaPageCount(rowCount);
  const page = Number(state.nandaPage) || 1;
  state.nandaPage = Math.min(Math.max(page, 1), pageCount);
  return state.nandaPage;
}

function paginatedNandaRows(rows) {
  const page = clampNandaPage(rows.length);
  const start = (page - 1) * NANDA_ROWS_PER_PAGE;
  return rows.slice(start, start + NANDA_ROWS_PER_PAGE);
}

function nandaDepartmentLabel(row = {}) {
  return cleanLine(row.khoa) || "Chua co khoa";
}

function nandaDepartmentGroupKey(department) {
  return searchKey(department) || "__no_department__";
}

function nandaRowsGroupedByDepartment(rows = []) {
  const grouped = new Map();
  for (const row of rows) {
    const department = nandaDepartmentLabel(row);
    const key = nandaDepartmentGroupKey(department);
    if (!grouped.has(key)) {
      grouped.set(key, {
        key,
        department,
        rows: [],
        groups: new Map(),
      });
    }
    const departmentGroup = grouped.get(key);
    departmentGroup.rows.push(row);

    const problemGroup = cleanLine(row.nhom_van_de) || "Chua co nhom";
    const problemGroupKey = searchKey(problemGroup) || "__no_group__";
    if (!departmentGroup.groups.has(problemGroupKey)) {
      departmentGroup.groups.set(problemGroupKey, {
        key: problemGroupKey,
        name: problemGroup,
        rows: [],
      });
    }
    departmentGroup.groups.get(problemGroupKey).rows.push(row);
  }

  return [...grouped.values()]
    .map((item) => ({
      ...item,
      groups: [...item.groups.values()].sort((a, b) => a.name.localeCompare(b.name, "vi")),
    }))
    .sort((a, b) => a.department.localeCompare(b.department, "vi"));
}

function nandaDepartmentOptions() {
  return uniqueCleanValues(Array.isArray(state.departmentCatalog) ? state.departmentCatalog : []);
}

function nandaDepartmentEntrySummary() {
  const counts = new Map();
  for (const row of state.nandaRows || []) {
    const department = normalizeNandaDepartmentValue(row.khoa);
    const key = searchKey(department);
    if (!key) continue;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return nandaDepartmentOptions().map((department) => ({
    department,
    count: counts.get(searchKey(department)) || 0,
  }));
}

function isValidNandaDepartment(value) {
  const key = searchKey(value);
  if (!key) return false;
  return nandaDepartmentOptions().some((item) => searchKey(item) === key);
}

function normalizeNandaDepartmentValue(value) {
  const key = searchKey(value);
  if (!key) return "";
  return nandaDepartmentOptions().find((item) => searchKey(item) === key) || cleanLine(value);
}

function rememberNandaDepartment(value) {
  const department = normalizeNandaDepartmentValue(value);
  if (!department) return "";
  state.nandaLastDepartment = department;
  writeStoredNandaDepartment(department);
  return department;
}

function latestNandaEnteredDepartment() {
  const latestRow = (state.nandaRows || []).find((row) => cleanLine(row.khoa));
  return normalizeNandaDepartmentValue(state.nandaLastDepartment || latestRow?.khoa || "");
}

function nandaFormWithLatestDepartment(form = createDefaultNandaForm()) {
  const next = { ...createDefaultNandaForm(), ...form };
  if (!cleanLine(next.khoa)) next.khoa = latestNandaEnteredDepartment();
  return next;
}

function applyLatestDepartmentToNandaForm() {
  if (state.nandaEditingId || cleanLine(state.nandaForm.khoa)) return;
  const department = latestNandaEnteredDepartment();
  if (department) state.nandaForm.khoa = department;
}

function uniqueCleanValues(values) {
  const grouped = new Map();
  for (const value of values) {
    const clean = cleanLine(value);
    const key = searchKey(clean);
    if (clean && !grouped.has(key)) grouped.set(key, clean);
  }
  return [...grouped.values()].sort((a, b) => a.localeCompare(b, "vi"));
}

function nandaProblemRows() {
  return Array.isArray(state.problemCatalog) ? state.problemCatalog : [];
}

function nandaGroupOptions() {
  return uniqueCleanValues(nandaProblemRows().map((item) => item.nhom_van_de));
}

function nandaProblemOptions() {
  const selectedGroup = searchKey(state.nandaForm.nhom_van_de);
  const rows = selectedGroup
    ? nandaProblemRows().filter((item) => searchKey(item.nhom_van_de) === selectedGroup)
    : nandaProblemRows();
  return uniqueCleanValues(rows.map((item) => item.van_de));
}

function findProblemGroupByProblem(problem) {
  const key = searchKey(problem);
  if (!key) return "";
  const matches = nandaProblemRows().filter((item) => searchKey(item.van_de) === key);
  const groups = uniqueCleanValues(matches.map((item) => item.nhom_van_de));
  return groups.length === 1 ? groups[0] : "";
}

function interventionCodeCatalogItems() {
  const grouped = new Map();
  for (const item of state.interventionCatalog || []) {
    const option = {
      code: cleanLine(item.ma_hoa || item.code),
      name: cleanLine(item.danh_muc_huong_dan_cham_soc || item.name || item.content),
    };
    const key = interventionOptionKey(option);
    if ((option.code || option.name) && !grouped.has(key)) grouped.set(key, option);
  }
  return [...grouped.values()];
}

function interventionMatchKey(value) {
  return searchKey(value)
    .replace(/\s+/g, " ")
    .replace(/[‐‑‒–—―]/g, "-")
    .trim();
}

function findNandaInterventionByCode(code) {
  const key = interventionMatchKey(code);
  if (!key) return null;
  return interventionCodeCatalogItems().find((item) => interventionMatchKey(item.code) === key) || null;
}

function findNandaInterventionByName(name) {
  const key = interventionMatchKey(name);
  if (!key) return null;
  return interventionCodeCatalogItems().find((item) => interventionMatchKey(item.name) === key) || null;
}

function syncNandaLinkedFields(field) {
  if (field === "van_de" && !cleanLine(state.nandaForm.nhom_van_de)) {
    const group = findProblemGroupByProblem(state.nandaForm.van_de);
    if (group) state.nandaForm.nhom_van_de = group;
  }
}

function updateNandaFormDomFields() {
  for (const [field, value] of Object.entries(state.nandaForm)) {
    const input = app.querySelector(`[data-nanda-field="${field}"]`);
    if (input && input.value !== value) input.value = value;
  }
  resizeNandaAutosizeTextareas();
}

function resizeTextareaToContent(textarea) {
  if (!textarea) return;
  const minHeight = Number.parseFloat(window.getComputedStyle(textarea).minHeight) || 42;
  textarea.style.height = "auto";
  textarea.style.height = `${Math.max(textarea.scrollHeight, minHeight)}px`;
}

function resizeNandaAutosizeTextareas(root = app) {
  root.querySelectorAll("textarea[data-nanda-autosize]").forEach(resizeTextareaToContent);
}

function nandaGoalItems() {
  return String(state.nandaForm.muc_tieu_can_thiep || "")
    .split("\n")
    .map((item) => cleanLine(item));
}

function setNandaGoalItems(goals) {
  state.nandaForm.muc_tieu_can_thiep = goals.map((item) => cleanLine(item)).join("\n");
}

function splitNandaLines(value) {
  return String(value || "")
    .split("\n")
    .map((item) => cleanLine(item));
}

function nandaInterventionRows(form = state.nandaForm) {
  const codes = splitNandaLines(form.ma_can_thiep);
  const contents = splitNandaLines(form.noi_dung_can_thiep);
  const length = Math.max(codes.length, contents.length, 1);
  return Array.from({ length }, (_, index) => ({
    code: codes[index] || "",
    content: contents[index] || "",
  }));
}

function setNandaInterventionRows(rows) {
  state.nandaForm.ma_can_thiep = rows.map((row) => cleanLine(row.code)).join("\n");
  state.nandaForm.noi_dung_can_thiep = rows.map((row) => cleanLine(row.content)).join("\n");
}

function completedNandaInterventionRows(form = state.nandaForm) {
  return nandaInterventionRows(form).filter((row) => cleanLine(row.code) || cleanLine(row.content));
}

function renderNandaRowCard(row) {
  return `
    <article class="nanda-row">
      <div class="nanda-row-main">
        <div class="nanda-row-meta">
          <span>Nhom: ${h(row.nhom_van_de || "Chua co nhom")}</span>
        </div>
        ${formatNandaDiagnosis(row) ? `<p><b>Chan doan dieu duong:</b> ${h(formatNandaDiagnosis(row))}</p>` : ""}
        <p><b>Van de:</b> ${h(row.van_de)}</p>
        ${row.nguyen_nhan ? `<p><b>Nguyen nhan:</b> ${h(row.nguyen_nhan)}</p>` : ""}
        ${row.muc_tieu_can_thiep ? `<p><b>Muc tieu:</b> ${h(row.muc_tieu_can_thiep)}</p>` : ""}
        ${completedNandaInterventionRows(row).map((item) => `<p><b>Can thiep:</b> ${item.code ? `${h(item.code)}: ` : ""}${h(item.content)}</p>`).join("")}
      </div>
      <div class="nanda-row-actions">
        <button type="button" class="btn" data-action="edit-nanda" data-nanda-id="${h(row.id)}">Sua</button>
        <button type="button" class="btn danger" data-action="delete-nanda" data-nanda-id="${h(row.id)}">Xoa</button>
      </div>
    </article>
  `;
}

function renderNandaDepartmentGroupList(departmentGroups) {
  return `
    <div class="nanda-department-list">
      ${departmentGroups.map((departmentGroup) => {
        const expanded = state.nandaExpandedDepartments.has(departmentGroup.key);
        const problemGroupCount = departmentGroup.groups.length;
        return `
          <section class="nanda-department-group ${expanded ? "is-open" : ""}">
            <button
              type="button"
              class="nanda-department-toggle"
              data-action="toggle-nanda-department"
              data-department-key="${h(departmentGroup.key)}"
              aria-expanded="${expanded ? "true" : "false"}"
            >
              <span class="nanda-department-chevron" aria-hidden="true"></span>
              <span class="nanda-department-title">${h(departmentGroup.department)}</span>
              <span class="nanda-department-badges">
                <strong>${h(departmentGroup.rows.length)} chan doan</strong>
                <span>${h(problemGroupCount)} nhom</span>
              </span>
            </button>
            ${expanded ? `
              <div class="nanda-department-content">
                ${departmentGroup.groups.map((problemGroup) => `
                  <section class="nanda-problem-group">
                    <div class="nanda-problem-group-header">
                      <h3>${h(problemGroup.name)}</h3>
                      <span>${h(problemGroup.rows.length)} dong</span>
                    </div>
                    <div class="nanda-row-list">
                      ${problemGroup.rows.map(renderNandaRowCard).join("")}
                    </div>
                  </section>
                `).join("")}
              </div>
            ` : ""}
          </section>
        `;
      }).join("")}
    </div>
  `;
}

function syncNandaInterventionRow(rows, index, field) {
  const row = rows[index];
  if (!row) return;
  if (field === "code") {
    const matched = findNandaInterventionByCode(row.code);
    if (matched?.name) row.content = matched.name;
  }
  if (field === "content") {
    const matched = findNandaInterventionByName(row.content);
    if (matched?.code) row.code = matched.code;
  }
}

function validateNandaInterventionSelection(rows = completedNandaInterventionRows()) {
  if (!rows.length) {
    throw new Error("Vui long nhap it nhat mot Noi dung can thiep.");
  }

  for (const row of rows) {
    const content = cleanLine(row.content);
    if (!content) {
      throw new Error("Moi dong can thiep phai co Noi dung can thiep.");
    }
  }
}

function nandaInterventionOptions() {
  return interventionCodeCatalogItems();
}

function careNandaRows() {
  return Array.isArray(state.nandaRows) ? state.nandaRows : [];
}

function careNandaDiagnosisOptions() {
  return uniqueCleanValues(diagnosisCatalogRows().flatMap((row) => splitSuggestionLines(row.nanda)));
}

function careNandaCauseOptions() {
  return uniqueCleanValues([
    ...diagnosisCatalogRows().flatMap((row) => splitSuggestionLines(row.cause)),
    ...careNandaRows().map((row) => row.nguyen_nhan),
  ]);
}

function careNandaGoalOptions() {
  return uniqueCleanValues([
    ...diagnosisCatalogRows().flatMap((row) => splitSuggestionLines(row.noc)),
    ...careNandaRows().flatMap((row) => splitNandaLines(row.muc_tieu_can_thiep)),
  ]);
}

function careNandaInterventionOptions() {
  const grouped = new Map();
  const addOption = (option) => {
    const cleanOption = {
      code: cleanLine(option.code),
      name: cleanLine(option.name || option.content),
    };
    const key = interventionOptionKey(cleanOption);
    if ((cleanOption.code || cleanOption.name) && !grouped.has(key)) grouped.set(key, cleanOption);
  };
  diagnosisCatalogRows().flatMap((row) => row.interventions || []).forEach(addOption);
  careNandaRows().flatMap((row) => completedNandaInterventionRows(row)).forEach(addOption);
  interventionCodeCatalogItems().forEach(addOption);
  return [...grouped.values()];
}

function renderCareNandaDatalists() {
  const interventionOptions = careNandaInterventionOptions();
  return `
    ${renderDatalist("care-nanda-diagnosis-options", careNandaDiagnosisOptions())}
    ${renderDatalist("care-nanda-cause-options", careNandaCauseOptions())}
    ${renderDatalist("care-nanda-goal-options", careNandaGoalOptions())}
    ${renderDatalist("care-nanda-intervention-code-options", interventionOptions, "code", "name")}
    ${renderDatalist("care-nanda-intervention-content-options", interventionOptions, "name", "code")}
  `;
}

function renderDatalist(id, options, valueKey = null, labelKey = null) {
  return `
    <datalist id="${h(id)}">
      ${options.map((item) => {
        const value = valueKey ? item[valueKey] : item;
        const label = labelKey ? item[labelKey] : "";
        return `<option value="${h(value)}"${label ? ` label="${h(label)}"` : ""}></option>`;
      }).join("")}
    </datalist>
  `;
}

function supabaseErrorMentionsColumn(error, column) {
  const key = searchKey(column);
  return [error?.message, error?.details, error?.hint, error?.code]
    .map((value) => searchKey(value || ""))
    .some((value) => value.includes(key) || value.includes(`'${key}'`) || value.includes(`"${key}"`));
}

function nandaPayloadForCurrentSchema(payload) {
  if (state.nandaSchemaSupportsDepartment !== false) return payload;
  const { khoa, ...rest } = payload;
  return rest;
}

async function queryNandaRows() {
  return getSupabaseClient()
    .from("nanda")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
}

async function refreshNandaRowsForDuplicateCheck() {
  if (!isSupabaseConfigured()) return;
  const { data, error } = await queryNandaRows();
  if (error) return;
  if ((data || []).some((row) => Object.prototype.hasOwnProperty.call(row, "khoa"))) {
    state.nandaSchemaSupportsDepartment = true;
  }
  state.nandaRows = (data || []).map((row) => ({ khoa: "", ...row }));
  const latestDepartment = latestNandaEnteredDepartment();
  if (latestDepartment) rememberNandaDepartment(latestDepartment);
  applyLatestDepartmentToNandaForm();
  state.nandaLoaded = true;
}

function duplicateNandaRowsForPayload(payload) {
  const problemKey = searchKey(payload.van_de);
  const causeKey = searchKey(payload.nguyen_nhan);
  if (!problemKey || !causeKey) return [];
  return careNandaRows().filter((row) =>
    String(row.id) !== String(state.nandaEditingId || "") &&
    searchKey(row.van_de) === problemKey &&
    searchKey(row.nguyen_nhan) === causeKey,
  );
}

function nandaDuplicateRowDetail(row) {
  const interventions = completedNandaInterventionRows(row)
    .map((item) => `${cleanLine(item.code) ? `${cleanLine(item.code)}: ` : ""}${cleanLine(item.content)}`)
    .filter(Boolean)
    .join("; ");
  return [
    `Khoa: ${cleanLine(row.khoa) || "Chua co khoa"}`,
    `Chan doan dieu duong: ${formatNandaDiagnosis(row) || cleanLine(row.van_de) || "Chua co"}`,
    `Ma can thiep: ${cleanLine(row.ma_can_thiep) || "Chua co"}`,
    `Can thiep: ${interventions || cleanLine(row.noi_dung_can_thiep) || "Chua co"}`,
  ].join("\n");
}

function confirmDuplicateNandaSave(payload) {
  const duplicates = duplicateNandaRowsForPayload(payload);
  if (!duplicates.length) return true;
  const details = duplicates
    .slice(0, 3)
    .map((row, index) => `${index + 1}. ${nandaDuplicateRowDetail(row)}`)
    .join("\n\n");
  const extra = duplicates.length > 3 ? `\n\nCon ${duplicates.length - 3} dong trung khac.` : "";
  return confirm([
    `Van de "${payload.van_de}" va nguyen nhan "${payload.nguyen_nhan}" da duoc nhap boi:`,
    "",
    details,
    extra,
    "",
    "Co dong y them tiep vao bang du lieu khong?",
  ].join("\n"));
}

async function loadNandaRows(force = false) {
  if (!force && (state.nandaLoading || state.nandaLoaded)) return;
  state.nandaLoading = true;
  state.nandaError = "";

  if (!isSupabaseConfigured()) {
    state.nandaRows = [];
    state.nandaLoaded = true;
    state.nandaLoading = false;
    state.nandaError = "Chưa cấu hình Supabase nên chưa tải được danh mục NANDA.";
    setTimeout(() => {
      if (state.screen === "nanda") render();
    }, 0);
    return;
  }

  try {
    const { data, error } = await queryNandaRows();
    if (error) throw error;
    if ((data || []).some((row) => Object.prototype.hasOwnProperty.call(row, "khoa"))) {
      state.nandaSchemaSupportsDepartment = true;
    }
    state.nandaRows = (data || []).map((row) => ({ khoa: "", ...row }));
    const latestDepartment = latestNandaEnteredDepartment();
    if (latestDepartment) rememberNandaDepartment(latestDepartment);
    applyLatestDepartmentToNandaForm();
    state.nandaLoaded = true;
  } catch (error) {
    state.nandaError = error.message || String(error);
    state.nandaLoaded = true;
  } finally {
    state.nandaLoading = false;
    if (
      state.screen === "nanda" ||
      (state.screen === "careForm" && (state.activeCareFormTab === "diagnosis" || state.activeCareFormTab === "intervention"))
    ) {
      render();
    }
  }
}

async function saveNandaForm() {
  const payload = normalizeNandaPayload(state.nandaForm);
  if (!payload.khoa || !payload.nhom_van_de || !payload.van_de || !payload.noi_dung_can_thiep) {
    throw new Error("Vui long nhap Khoa, Nhom van de, Van de va Noi dung can thiep.");
  }
  if (!isValidNandaDepartment(payload.khoa)) {
    throw new Error("Khoa phai chon trong danh muc goi y tu dmkhoa.json.");
  }
  payload.khoa = normalizeNandaDepartmentValue(payload.khoa);
  const interventionRows = completedNandaInterventionRows(payload);
  validateNandaInterventionSelection(interventionRows);
  payload.ma_can_thiep = interventionRows.map((row) => cleanLine(row.code)).join("\n");
  payload.noi_dung_can_thiep = interventionRows.map((row) => cleanLine(row.content)).join("\n");

  await refreshNandaRowsForDuplicateCheck();
  if (!confirmDuplicateNandaSave(payload)) return false;

  const client = getSupabaseClient();
  let dbPayload = nandaPayloadForCurrentSchema(payload);
  if (state.nandaEditingId) {
    let { error } = await client.from("nanda").update(dbPayload).eq("id", state.nandaEditingId);
    if (error && state.nandaSchemaSupportsDepartment !== false && supabaseErrorMentionsColumn(error, "khoa")) {
      state.nandaSchemaSupportsDepartment = false;
      dbPayload = nandaPayloadForCurrentSchema(payload);
      ({ error } = await client.from("nanda").update(dbPayload).eq("id", state.nandaEditingId));
    }
    if (error) throw error;
  } else {
    let { error } = await client.from("nanda").insert(dbPayload);
    if (error && state.nandaSchemaSupportsDepartment !== false && supabaseErrorMentionsColumn(error, "khoa")) {
      state.nandaSchemaSupportsDepartment = false;
      dbPayload = nandaPayloadForCurrentSchema(payload);
      ({ error } = await client.from("nanda").insert(dbPayload));
    }
    if (error) throw error;
  }

  rememberNandaDepartment(payload.khoa);
  state.nandaForm = nandaFormWithLatestDepartment();
  state.nandaEditingId = null;
  state.nandaLoaded = false;
  state.nandaPage = 1;
  await loadNandaRows(true);
  return true;
}

async function deleteNandaRow(id) {
  const { error } = await getSupabaseClient().from("nanda").delete().eq("id", id);
  if (error) throw error;
  if (String(state.nandaEditingId) === String(id)) {
    state.nandaEditingId = null;
    state.nandaForm = nandaFormWithLatestDepartment();
  }
  state.nandaLoaded = false;
  await loadNandaRows(true);
}

function renderNandaFormScreen() {
  loadNandaRows();
  applyLatestDepartmentToNandaForm();
  const form = state.nandaForm;
  const rows = filteredNandaRows();
  const departmentGroups = nandaRowsGroupedByDepartment(rows);
  const editing = Boolean(state.nandaEditingId);
  const interventionOptions = nandaInterventionOptions();
  const departmentOptions = nandaDepartmentOptions();
  const departmentSummaryRows = nandaDepartmentEntrySummary();
  const goalItems = nandaGoalItems();
  const interventionRows = nandaInterventionRows();
  const enteredDepartments = nandaEnteredDepartmentOptions();
  const enteredGroups = nandaEnteredGroupOptions();

  return `
    <div class="mobile-app nanda-screen">
      ${appBar("Danh mục NANDA", "patients")}
      <div class="nanda-ai-toolbar">
        ${renderDiagnosisAiTools()}
        ${renderNandaAutoFillBox()}
      </div>
      <main class="nanda-layout">
        <section class="panel nanda-form-panel">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">Chẩn đoán điều dưỡng</h2>
            </div>
          </div>
          <div class="panel-body">
            <div class="field-grid nanda-field-grid">
              <div class="field">
                <label>Khoa *</label>
                <input type="search" list="nanda-khoa-options" data-nanda-field="khoa" value="${h(form.khoa)}" placeholder="Chon khoa" />
              </div>
              <div class="field">
                <label>Nhóm vấn đề *</label>
                <input type="text" list="nanda-group-options" data-nanda-field="nhom_van_de" value="${h(form.nhom_van_de)}" placeholder="Ví dụ: Hô hấp" />
              </div>
              <div class="field">
                <label>Vấn đề *</label>
                <textarea rows="1" data-nanda-field="van_de" data-nanda-autosize placeholder="Ví dụ: Khó thở">${h(form.van_de)}</textarea>
              </div>
              <div class="field">
                <label>Nguyên nhân</label>
                <textarea rows="1" data-nanda-field="nguyen_nhan" data-nanda-autosize placeholder="Nhập nguyên nhân liên quan">${h(form.nguyen_nhan)}</textarea>
              </div>
              <div class="field wide nanda-goals-field">
                <label>Mục tiêu can thiệp</label>
                <div class="nanda-goal-list">
                  ${goalItems.map((goal, index) => `
                    <div class="nanda-goal-row">
                      <input type="text" data-nanda-goal-index="${index}" value="${h(goal)}" placeholder="Nhập mục tiêu ${index + 1}" />
                      ${goalItems.length > 1 ? `<button type="button" class="remove-row-btn" data-action="remove-nanda-goal" data-goal-index="${index}" aria-label="Xóa mục tiêu">Xóa</button>` : ""}
                    </div>
                  `).join("")}
                </div>
                <button type="button" class="btn nanda-add-goal-btn" data-action="add-nanda-goal">Thêm mục tiêu</button>
              </div>
              <div class="field wide nanda-interventions-field">
                <label>Can thiệp điều dưỡng *</label>
                <div class="nanda-intervention-list">
                  ${interventionRows.map((item, index) => `
                    <div class="nanda-intervention-row">
                      <div class="field">
                        <label>Nội dung can thiệp</label>
                        <input type="text" list="nanda-intervention-content-options" data-nanda-intervention-field="content" data-intervention-index="${index}" value="${h(item.content)}" placeholder="Chon hoac nhap noi dung can thiep" />
                      </div>
                      <div class="field">
                        <label>Mã can thiệp</label>
                        <input type="text" list="nanda-intervention-code-options" data-nanda-intervention-field="code" data-intervention-index="${index}" value="${h(item.code)}" placeholder="Co the de trong" />
                      </div>
                      ${interventionRows.length > 1 ? `<button type="button" class="remove-row-btn" data-action="remove-nanda-intervention" data-intervention-index="${index}" aria-label="Xóa can thiệp">Xóa</button>` : ""}
                    </div>
                  `).join("")}
                </div>
                <button type="button" class="btn nanda-add-goal-btn" data-action="add-nanda-intervention">Thêm can thiệp</button>
              </div>
            </div>
            <div class="nanda-actions">
              <button type="button" class="btn primary" data-action="save-nanda">${editing ? "Cập nhật" : "Lưu"}</button>
              <button type="button" class="btn" data-action="clear-nanda-form">Làm mới</button>
              <button type="button" class="btn ghost" data-action="refresh-nanda">Tải lại</button>
            </div>
          </div>
        </section>

        <section class="panel nanda-list-panel">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">Danh sách đã nhập</h2>
              <p class="panel-subtitle">${state.nandaLoading ? "Đang tải dữ liệu..." : `${rows.length}/${state.nandaRows.length} dòng`}</p>
            </div>
          </div>
          <div class="panel-body">
            <div class="nanda-department-summary">
              <div class="nanda-department-summary-header">
                <h3>Danh sách nhập theo khoa</h3>
                <span>Tên khoa / Số đã nhập</span>
              </div>
              <div class="nanda-department-summary-grid">
                ${departmentSummaryRows.map((item) => `
                  <div class="nanda-department-summary-row">
                    <span class="nanda-department-summary-name">${h(item.department)}</span>
                    <strong class="nanda-department-summary-count">${h(item.count)}</strong>
                  </div>
                `).join("")}
              </div>
            </div>
            <div class="field nanda-search-field">
              <label>Tim kiem</label>
              <input type="search" data-nanda-search value="${h(state.nandaSearch)}" placeholder="Tim theo khoa, nhom, van de, ma hoac noi dung" />
            </div>
            <div class="nanda-filter-row">
              <div class="field nanda-department-filter-field">
                <label>Loc theo khoa</label>
                <select data-nanda-department-filter>
                  <option value="">Tat ca khoa</option>
                  ${enteredDepartments.map((department) => `
                    <option value="${h(department)}" ${searchKey(state.nandaDepartmentFilter) === searchKey(department) ? "selected" : ""}>${h(department)}</option>
                  `).join("")}
                </select>
              </div>
              <div class="field nanda-group-filter-field">
                <label>Loc theo nhom van de</label>
                <select data-nanda-group-filter>
                  <option value="">Tat ca nhom van de</option>
                  ${enteredGroups.map((group) => `
                    <option value="${h(group)}" ${searchKey(state.nandaGroupFilter) === searchKey(group) ? "selected" : ""}>${h(group)}</option>
                  `).join("")}
                </select>
              </div>
            </div>
            ${state.nandaError ? `<div class="empty care-list-empty">Khong tai duoc du lieu: ${h(state.nandaError)}</div>` : ""}
            ${!state.nandaError && state.nandaLoading ? `<div class="empty care-list-empty">Dang tai danh muc NANDA...</div>` : ""}
            ${!state.nandaError && !state.nandaLoading && !rows.length ? `<div class="empty care-list-empty">Chua co du lieu phu hop.</div>` : ""}
            ${!state.nandaError && rows.length ? renderNandaDepartmentGroupList(departmentGroups) : ""}
          </div>
        </section>
      </main>
      ${renderDatalist("nanda-khoa-options", departmentOptions)}
      ${renderDatalist("nanda-group-options", nandaGroupOptions())}
      ${renderDatalist("nanda-problem-options", nandaProblemOptions())}
      ${renderDatalist("nanda-intervention-code-options", interventionOptions, "code", "name")}
      ${renderDatalist("nanda-intervention-content-options", interventionOptions, "name", "code")}
    </div>
  `;
}

function patientHomeAppBar() {
  return `
    <header class="app-bar patient-home-app-bar">
      <span></span>
      <h1>Phiên bản cập nhật 28/5/2026</h1>
      <button class="grid-icon" data-screen="patients" aria-label="Danh sách">
        <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
      </button>
    </header>
  `;
}

const homeExperienceCards = [
  {
    title: "Giới thiệu mẫu phiếu chăm sóc điều dưỡng trên bệnh án điện tử",
    action: "show-experience-guide",
    icon: "i",
    note: "Xem mục tiêu, cách trải nghiệm và góp ý hoàn thiện mẫu phiếu.",
  },
  {
    title: "Test chức năng phiếu chăm sóc đầy đủ",
    action: "start-full-care-test",
    icon: "+",
    note: "Mở form phiếu chăm sóc với đầy đủ các tab nhập liệu.",
  },
  {
    title: "Test chức năng Chẩn đoán điều dưỡng",
    action: "start-diagnosis-test",
    icon: "CĐ",
    note: "Vào trực tiếp phần chẩn đoán, nguyên nhân và mục tiêu.",
  },
  {
    title: "Danh mục NANDA",
    action: "open-nanda-form",
    icon: "ND",
    note: "Thêm, sửa và tra cứu nhóm vấn đề, nguyên nhân, mục tiêu và can thiệp.",
  },
  {
    title: "Test chức năng Tư vấn, hướng dẫn GDSK",
    action: "start-education-test",
    icon: "TV",
    note: "Mở phần tư vấn, hướng dẫn, giáo dục sức khỏe.",
  },
  {
    title: "Test chức năng đánh giá nguy cơ (theo thang điểm)",
    action: "start-scale-test",
    icon: "Đ",
    note: "Mở nhận định và bảng chấm điểm nguy cơ.",
  },
  {
    title: "Đánh giá sau trải nghiệm Form điện tử",
    action: "open-sample-evaluation",
    tone: "danger",
    icon: "✓",
    note: "Gửi phản hồi sau khi hoàn tất trải nghiệm.",
  },
  {
    title: "Thông tin cập nhật",
    action: "show-update-info",
    icon: "26/5",
    note: "Xem nội dung thay đổi trong phiên bản cập nhật ngày 28/5/2026.",
  },
];

function showUpdateInfo() {
  alert([
    "Thông tin cập nhật ngày 28/5/2026",
    "",
    "- Fix lỗi nhập vào ô textbox phải chọn lại mới nhập được tiếp",
    "- Bổ sung các nội dung nhận định theo các cơ quan mà các khoa đã ý kiến bổ sung",
    "- Bổ sung phần nhận định riêng cho khoa B10 (sản phụ khoa) ở dạng thu gọn cho tối ưu form tích chọn sản phụ khoa mới hiển thị form nhập thông tin",
    "- Bổ sung bàn giao chi tiết về thuốc khi chọn bàn giao thuốc",
    "",
    "Lưu ý nội dung chẩn đoán điều dưỡng và can thiệp là dữ liệu demo chưa đầy đủ theo các chuyên khoa, vì vậy để đầy đủ thì các khoa cần cung cấp cho phòng điều dưỡng nội dung chẩn đoán điều dưỡng của chuyên khoa mình",
    "",
    "Cấu trúc chẩn đoán điều dưỡng theo Nanda NIC NOC",
    "Vấn đề/triệu chứng + Nguyên nhân (nếu có) >> Mục tiêu can thiệp >> Can thiệp điều dưỡng",
  ].join("\n"));
}

function renderPatientListScreen() {
  return `
    <div class="mobile-app patient-list-screen home-screen">
      ${patientHomeAppBar()}
      <section class="home-hero">
        <div>
          <h2>Chọn nội dung cần trải nghiệm</h2>
          <p>Mỗi thẻ bên dưới sẽ mở trực tiếp đúng chức năng cần test trên mẫu phiếu điện tử.</p>
        </div>
      </section>
      <section class="home-action-grid" aria-label="Danh sách chức năng trải nghiệm">
        ${homeExperienceCards.map((card) => `
          <button type="button" class="home-action-card ${card.tone ? `home-action-card-${h(card.tone)}` : ""}" data-action="${h(card.action)}">
            <span class="home-action-icon">${h(card.icon)}</span>
            <strong>${h(card.title)}</strong>
            <small>${h(card.note)}</small>
          </button>
        `).join("")}
      </section>
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

const riskScaleCards = [
  {
    title: "Đánh giá nguy cơ té ngã",
    note: "Chọn Morse, Humpty Dumpty hoặc OFRAS theo đối tượng người bệnh.",
    icon: "TN",
    scaleKey: "fallRiskAssessment",
  },
  {
    title: "Đánh giá mức độ viêm tĩnh mạch (VIP)",
    note: "Chấm điểm vị trí đường truyền và mức độ viêm tĩnh mạch.",
    icon: "VIP",
    scaleKey: "vteRiskAssessment",
  },
  {
    title: "Đánh giá đau (VAS)",
    note: "Chấm điểm đau theo thang điểm VAS.",
    icon: "VAS",
    scaleKey: "painAssessment",
  },
  {
    title: "Đánh giá nguy cơ loét tỳ đè (Braden)",
    note: "Đánh giá nguy cơ loét do tỳ đè.",
    icon: "BR",
    scaleKey: "pressureUlcerRiskAssessment",
  },
  {
    title: "Đánh giá Glasgow (GCS)",
    note: "Đánh giá tri giác bằng thang điểm Glasgow.",
    icon: "GCS",
    scaleKey: "glasgowAssessment",
  },
];

function renderRiskScaleHomeScreen() {
  return `
    <div class="mobile-app patient-list-screen home-screen risk-scale-screen">
      ${appBar("Đánh giá nguy cơ", "patients")}
      <section class="home-hero">
        <div>
          <h2>Chọn bảng điểm đánh giá nguy cơ</h2>
          <p>Chọn một bảng điểm để mở form chấm điểm tương ứng.</p>
        </div>
      </section>
      <section class="home-action-grid risk-scale-grid" aria-label="Danh sách bảng điểm đánh giá nguy cơ">
        ${riskScaleCards.map((card) => `
          <button type="button" class="home-action-card" data-action="open-risk-scale" data-scale-key="${h(card.scaleKey)}">
            <span class="home-action-icon">${h(card.icon)}</span>
            <strong>${h(card.title)}</strong>
            <small>${h(card.note)}</small>
          </button>
        `).join("")}
      </section>
    </div>
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
          <div class="care-list-tabs">
            <button type="button" class="btn ${state.careListTab === "care" ? "primary" : ""}" data-care-list-tab="care">Phiếu chăm sóc</button>
            <button type="button" class="btn ${state.careListTab === "education" ? "primary" : ""}" data-care-list-tab="education">Tư vấn, Hướng dẫn, GDSK</button>
          </div>
          ${state.careListTab === "education" ? renderHealthEducationDetailListBodyV2() : renderCareSheetListBody()}
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
          <div class="care-sheet-code">
            <span class="care-sheet-code-label">Mã phiếu</span>
            <strong>${h(sheet.ma_phieu || `Phiếu #${sheet.id}`)}</strong>
            <span class="care-sheet-level">Cấp chăm sóc: ${h(sheet.cap_cham_soc || "-")}</span>
          </div>
          <div class="care-sheet-evaluation-time">
            <span>Thời gian đánh giá</span>
            <strong>${h(formatDateTime(sheet.thoi_gian_danh_gia || sheet.created_at))}</strong>
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

function healthEducationEntriesFromSheets() {
  const labels = {
    admission: "Bắt đầu nhập viện",
    treatment: "Trong khi điều trị",
    discharge: "Trước khi ra viện",
    summary: "Tổng hợp",
  };
  return state.careSheets.flatMap((sheet) => {
    const checklist = sheet.nhan_dinh_json?.checklist || {};
    const forms = checklist.healthEducationForms || {};
    return Object.entries(forms).flatMap(([stageKey, form]) => {
      const items = Array.isArray(form?.items) ? form.items : [];
      const rows = items
        .filter((item) => cleanLine(item.content) || cleanLine(item.need) || cleanLine(item.result))
        .map((item) => ({
          date: form.date || sheet.thoi_gian_danh_gia || sheet.created_at,
          sheetCode: sheet.ma_phieu || `Phiếu #${sheet.id}`,
          stage: labels[stageKey] || stageKey,
          content: item.content || "",
          need: item.need || "",
          result: item.result || "",
          note: "",
          staffName: form.staffName || "",
          patientSign: form.patientSign || "",
        }));
      if (cleanLine(form?.note)) {
        rows.push({
          date: form.date || sheet.thoi_gian_danh_gia || sheet.created_at,
          sheetCode: sheet.ma_phieu || `Phiếu #${sheet.id}`,
          stage: labels[stageKey] || stageKey,
          content: "Ghi chú",
          need: "",
          result: "",
          note: form.note,
          staffName: form.staffName || "",
          patientSign: form.patientSign || "",
        });
      }
      return rows;
    });
  });
}

function renderHealthEducationListBody() {
  if (state.careSheetsLoading) {
    return `<div class="empty care-list-empty">Đang tải danh sách tư vấn, giáo dục sức khỏe...</div>`;
  }
  if (state.careSheetsError) {
    return `<div class="empty care-list-empty">${h(state.careSheetsError)}</div>`;
  }
  const entries = healthEducationEntriesFromSheets();
  if (!entries.length) {
    return `<div class="empty care-list-empty">Chưa có nội dung tư vấn, hướng dẫn, giáo dục sức khỏe.</div>`;
  }
  const groups = entries.reduce((acc, entry) => {
    const key = formatDateTime(entry.date).split(" ")[0] || "Không rõ ngày";
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {});
  return `
    <div class="gdsk-list">
      ${Object.entries(groups).map(([date, rows]) => `
        <section class="gdsk-list-day">
          <h3>${h(date)}</h3>
          <div class="gdsk-table gdsk-summary-table">
            <div class="gdsk-row gdsk-head">
              <span>Phiếu/Giai đoạn</span>
              <span>Nội dung</span>
              <span>Nhu cầu</span>
              <span>Kết quả/Ghi chú</span>
            </div>
            ${rows.map((row) => `
              <div class="gdsk-row">
                <span>${h(row.sheetCode)}<br><small>${h(row.stage)}</small></span>
                <span>${h(row.content || "-")}</span>
                <span>${h(row.need || "-")}</span>
                <span>${h(row.note || row.result || "-")}</span>
              </div>
            `).join("")}
          </div>
        </section>
      `).join("")}
    </div>
  `;
}

function renderHealthEducationDetailListBody() {
  if (state.careSheetsLoading) {
    return `<div class="empty care-list-empty">Äang táº£i danh sÃ¡ch tÆ° váº¥n, giÃ¡o dá»¥c sá»©c khá»e...</div>`;
  }
  if (state.careSheetsError) {
    return `<div class="empty care-list-empty">${h(state.careSheetsError)}</div>`;
  }
  const latestSheetsByDate = latestHealthEducationSheetsByDate();
  if (!latestSheetsByDate.length) {
    return `<div class="empty care-list-empty">ChÆ°a cÃ³ ná»™i dung tÆ° váº¥n, hÆ°á»›ng dáº«n, giÃ¡o dá»¥c sá»©c khá»e.</div>`;
  }
  const selected = gdskPatientContext(patients[state.selectedPatientIndex] || patients[0] || {});
  return `
    <div class="gdsk-list gdsk-detail-list">
      ${latestSheetsByDate.map(({ date, sheet }) => `
        <section class="gdsk-list-day gdsk-detail-list-day">
          <div class="gdsk-list-day-header">
            <h3>${h(date)}</h3>
            <span>${h(sheet.ma_phieu || `Phiáº¿u #${sheet.id}`)} - phiáº¿u má»›i nháº¥t trong ngÃ y</span>
          </div>
          ${renderGdskDetailDocument(healthEducationFormsFromChecklist(sheet.nhan_dinh_json?.checklist || {}, sheet), {
            patient: selected,
            sheet,
          })}
        </section>
      `).join("")}
    </div>
  `;
}

function renderHealthEducationDetailListBodyV2() {
  if (state.careSheetsLoading) {
    return `<div class="empty care-list-empty">Đang tải danh sách tư vấn, giáo dục sức khỏe...</div>`;
  }
  if (state.careSheetsError) {
    return `<div class="empty care-list-empty">${h(state.careSheetsError)}</div>`;
  }
  const latestSheetsByDate = latestHealthEducationSheetsByDate();
  if (!latestSheetsByDate.length) {
    return `<div class="empty care-list-empty">Chưa có nội dung tư vấn, hướng dẫn, giáo dục sức khỏe.</div>`;
  }
  const selected = gdskPatientContext(patients[state.selectedPatientIndex] || patients[0] || {});
  return `
    <div class="gdsk-list gdsk-detail-list">
      ${latestSheetsByDate.map(({ date, sheet }) => `
        <section class="gdsk-list-day gdsk-detail-list-day">
          <div class="gdsk-list-day-header">
            <h3>${h(date)}</h3>
            <span>${h(sheet.ma_phieu || `Phiếu #${sheet.id}`)} - phiếu mới nhất trong ngày</span>
          </div>
          ${renderGdskDetailDocument(healthEducationFormsFromChecklist(sheet.nhan_dinh_json?.checklist || {}, sheet), {
            patient: selected,
            sheet,
          })}
        </section>
      `).join("")}
    </div>
  `;
}

function gdskPatientContext(selected = {}) {
  const dbPatient = state.careSheetsPatient || {};
  return {
    name: dbPatient.ho_ten || selected.name || state.patient.name || "",
    code: dbPatient.ma_benh_nhan || selected.code || state.patient.code || "",
    age: dbPatient.tuoi || selected.age || state.patient.age || "",
    sex: dbPatient.gioi_tinh || selected.sex || state.patient.sex || "",
    room: dbPatient.phong || selected.room || state.patient.room || "",
    bed: dbPatient.giuong || selected.bed || state.patient.bed || "",
    department: dbPatient.khoa || selected.department || state.patient.department || "",
  };
}

function latestHealthEducationSheetsByDate() {
  const groups = state.careSheets.reduce((acc, sheet) => {
    const key = careSheetDateKey(sheet);
    if (!acc[key] || careSheetTimeValue(sheet) > careSheetTimeValue(acc[key])) acc[key] = sheet;
    return acc;
  }, {});
  return Object.entries(groups)
    .sort((a, b) => careSheetTimeValue(b[1]) - careSheetTimeValue(a[1]))
    .map(([date, sheet]) => ({ date, sheet }));
}

function careSheetDateKey(sheet) {
  const date = parseDateTimeForVietnam(sheet.thoi_gian_danh_gia || sheet.created_at);
  if (!date) return "Không rõ ngày";
  return formatVietnamDate(date);
}

function careSheetTimeValue(sheet) {
  const date = parseDateTimeForVietnam(sheet.thoi_gian_danh_gia || sheet.created_at);
  return date ? date.getTime() : 0;
}

function healthEducationFormsFromChecklist(checklist = {}, sheet = null) {
  const defaults = createDefaultHealthEducationForms();
  const forms = checklist.healthEducationForms && typeof checklist.healthEducationForms === "object"
    ? checklist.healthEducationForms
    : {};
  const fallbackDate = sheet?.thoi_gian_danh_gia || sheet?.created_at || currentVietnamDateInput();
  const result = {
    admission: normalizeHealthEducationStage(defaults.admission, forms.admission),
    treatment: normalizeHealthEducationStage(defaults.treatment, forms.treatment),
    discharge: normalizeHealthEducationStage(defaults.discharge, forms.discharge),
    summary: { ...defaults.summary, ...(forms.summary || {}) },
  };
  ["admission", "treatment", "discharge"].forEach((stage) => {
    if (!forms[stage]?.date) result[stage].date = fallbackDate;
  });
  return result;
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
  return formatVietnamDateTime(value);
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

function detailSection(title, content, className = "") {
  return `
    <section class="report-section ${h(className)}">
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

function detailDiagnosisGoalsInterventions(diagnoses = [], interventions = []) {
  const diagnosisRows = diagnoses
    .map((item, index) => {
      const goals = Array.isArray(item.goals)
        ? item.goals
        : String(item.goal || "")
            .split("\n")
            .map(cleanLine)
            .filter(Boolean);
      return {
        label: `Chẩn đoán ĐD ${index + 1}`,
        diagnosis: cleanLine(item.diagnosis),
        causes: (Array.isArray(item.causes) ? item.causes : [])
          .map(cleanLine)
          .filter(Boolean),
        goals,
      };
    })
    .filter((item) => item.diagnosis || item.goals.length);

  const interventionLines = interventions
    .map((item) => [cleanLine(item.code), cleanLine(item.content)].filter(Boolean).join(" - "))
    .filter(Boolean);

  if (!diagnosisRows.length && !interventionLines.length) {
    return `<div class="empty">Chưa có chẩn đoán, mục tiêu hoặc can thiệp.</div>`;
  }

  return `
    <div class="report-care-plan-table">
      ${diagnosisRows.map((row) => `
        <div class="report-care-plan-row">
          <strong>${h(row.label)}</strong>
          <span>
            ${row.diagnosis ? `<em class="care-plan-diagnosis">${h(row.diagnosis)}</em>` : ""}
            ${row.causes.length ? `<em class="care-plan-cause">Liên quan tới: ${h(row.causes.join("; "))}</em>` : ""}
            ${row.goals.map((goal, index) => `
              <em class="care-plan-goal">Mục tiêu ${index + 1}: ${h(goal)}</em>
            `).join("")}
          </span>
        </div>
      `).join("")}
      ${interventionLines.length ? `
        <div class="report-care-plan-row report-care-plan-interventions">
          <strong>Can thiệp điều dưỡng</strong>
          <span>${interventionLines.map((line) => `<em>${h(line)}</em>`).join("")}</span>
        </div>
      ` : ""}
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
      !/^P\.\s*Bàn giao/i.test(item)
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
    handoverMedicineHalf: "Thuốc",
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
    .filter(([key]) => key !== "handoverMedicines")
    .filter(([, value]) => value === true || (typeof value === "string" && value.trim()))
    .map(([key, value]) => `${labels[key] || key}: ${value === true ? "Có" : value}`);
}

function handoverMedicineRows(handover = {}) {
  return (Array.isArray(handover.handoverMedicines) ? handover.handoverMedicines : [])
    .map((row) => normalizeHandoverMedicineRow(row || {}))
    .filter((row) => Object.values(row).some((value) => cleanLine(value)));
}

function detailHandoverMedicines(rows = []) {
  if (!rows.length) return "";
  return `
    <div class="report-medicine-table">
      <strong>Thuốc bàn giao</strong>
      <div class="report-medicine-scroll">
        <table>
          <thead><tr><th>Tên thuốc/Hàm lượng</th><th>Liều dùng</th><th>Đường dùng</th><th>Thời gian</th><th>Y lệnh</th></tr></thead>
          <tbody>
            ${rows.map((row) => `
              <tr>
                <td>${h([row.name, row.strength].filter(Boolean).join(" / ") || "-")}</td>
                <td>${h(row.dose || "-")}</td>
                <td>${h(row.route || "-")}</td>
                <td>${h(row.time || "-")}</td>
                <td>${h(row.order || "-")}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function careSheetWordFilename(sheet = {}) {
  const identifier = cleanLine(sheet.ma_phieu || `phieu-${sheet.id || currentVietnamDateInput()}`)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return `phieu-cham-soc-${identifier || "dieu-duong"}.doc`;
}

function careSheetWordStyles() {
  return `
    @page { size: A4; margin: 16mm; }
    body { margin: 0; color: #0f172a; font: 12pt "Times New Roman", serif; }
    .report-page { width: 100%; }
    .report-head { border-bottom: 3pt solid #047857; padding-bottom: 10pt; text-align: center; }
    .report-head h1 { margin: 0; color: #065f46; font-size: 18pt; text-transform: uppercase; }
    .report-head div { margin-top: 4pt; color: #475569; font-weight: bold; }
    .report-patient-card, .report-section { margin-top: 12pt; border: 1pt solid #cbd5e1; padding: 10pt; }
    .report-patient-card h2 { margin: 0 0 4pt; font-size: 15pt; text-transform: uppercase; }
    .report-patient-card p { margin: 0; }
    .report-section h2 { margin: 0 0 8pt; border-bottom: 1pt solid #cbd5e1; padding-bottom: 5pt; font-size: 12pt; text-transform: uppercase; }
    .report-grid { display: table; width: 100%; }
    .report-field { display: inline-block; width: 30%; min-width: 150pt; margin: 0 6pt 8pt 0; vertical-align: top; }
    .report-field div { color: #475569; font-size: 9pt; font-weight: bold; text-transform: uppercase; }
    .report-field span { display: block; min-height: 15pt; border: 1pt solid #cbd5e1; padding: 5pt; }
    .report-assessment-table div, .report-care-plan-row { border-bottom: 1pt solid #e2e8f0; padding: 5pt 0; }
    .report-assessment-table strong, .report-care-plan-row strong { display: block; }
    .report-assessment-table em, .report-care-plan-row em { display: block; font-style: normal; }
    .report-check { display: inline-block; margin: 4pt 12pt 4pt 0; }
    .report-check i { font-style: normal; font-weight: bold; margin-right: 4pt; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1pt solid #334155; padding: 4pt; vertical-align: top; }
    th { background: #f1f5f9; font-weight: bold; }
    .gdsk-detail-preview { margin: 0; padding: 0; }
    .gdsk-detail-document { font-size: 10pt; }
    .gdsk-detail-top, .gdsk-detail-patient, .gdsk-detail-signatures { display: table; width: 100%; }
    .gdsk-detail-top div, .gdsk-detail-signatures div { display: table-cell; width: 50%; }
    .gdsk-detail-top div:last-child { text-align: right; }
    .gdsk-detail-document h3 { text-align: center; font-size: 12pt; }
    .gdsk-detail-section { margin-top: 8pt; }
    .gdsk-detail-section h4 { margin: 0 0 4pt; }
    .gdsk-detail-note { margin-top: 6pt; border: 1pt solid #cbd5e1; padding: 5pt; }
    .gdsk-detail-signatures { margin-top: 8pt; text-align: center; }
    .gdsk-detail-signatures em { display: block; margin-top: 22pt; font-style: normal; font-weight: bold; }
    .report-signatures { margin-top: 20pt; text-align: right; }
    .report-signatures span { display: block; margin-top: 26pt; }
  `;
}

function exportCareSheetToWord() {
  const sheet = currentCareSheetDetail();
  const report = app.querySelector(".report-page");
  if (!sheet || !report) {
    alert("Không tìm thấy nội dung phiếu để xuất Word.");
    return;
  }
  const documentHtml = `<!doctype html>
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <title>Phiếu theo dõi và chăm sóc</title>
        <style>${careSheetWordStyles()}</style>
      </head>
      <body>${report.outerHTML}</body>
    </html>`;
  const blob = new Blob(["\ufeff", documentHtml], { type: "application/msword;charset=utf-8" });
  const link = document.createElement("a");
  const objectUrl = URL.createObjectURL(blob);
  link.href = objectUrl;
  link.download = careSheetWordFilename(sheet);
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
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
  const medicines = handoverMedicineRows(handover);
  const educationForms = healthEducationFormsFromChecklist(check, sheet);

  return `
    <div class="mobile-app care-detail-screen">
      ${appBar("Chi tiết phiếu chăm sóc", "careEmpty")}
      <div class="report-actions no-print">
        <button class="btn" data-screen="careEmpty">Quay lại</button>
        <button class="btn" data-action="edit-care-sheet" data-sheet-id="${h(sheet.id)}">Sửa phiếu</button>
        <button class="btn" data-action="export-word">Xuất Word</button>
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
          <div class="report-grid cols-3 report-admin-grid">
            ${detailField("Thời gian đánh giá", formatDateTime(sheet.thoi_gian_danh_gia))}
            ${detailField("Người đánh giá", sheet.nguoi_danh_gia)}
            ${detailField("Phân cấp chăm sóc", `CS cấp ${sheet.cap_cham_soc || "-"}`)}
            ${detailField("Chiều cao (cm)", check.height)}
            ${detailField("Cân nặng (kg)", check.weight)}
            ${detailField("BMI", check.bmi)}
            ${detailField("Dị ứng", check.allergy === "yes" ? `Có${allergyDetailsFromChecklist(check) ? `: ${allergyDetailsFromChecklist(check)}` : ""}` : "Không")}
          </div>
        `, "report-admin-section")}

        ${detailSection("II. Dấu hiệu sinh tồn", `
          <div class="report-grid cols-4 report-vitals-grid">
            ${detailField("Mạch", check.pulse)}
            ${detailField("Nhiệt độ", check.temperature)}
            ${detailField("Huyết áp", check.bloodPressure)}
            ${detailField("SpO2", check.spo2)}
          </div>
        `, "report-vitals-section")}

        ${detailSection("III. Nhận định điều dưỡng", detailValueList(assessmentItems))}

        ${detailSection("VIII. Thang điểm đánh giá", scaleRows.length ? detailTable(scaleRows) : `<div class="empty">Chưa có thang điểm đánh giá.</div>`)}

        ${detailSection("IX. Theo dõi dịch", `
          <div class="report-grid cols-3 report-fluid-grid">
            ${detailField("Dịch vào", check.fluidIn)}
            ${detailField("Dịch ra", check.fluidOut)}
            ${detailField("Bilance", fluidBalanceFromChecklist(check))}
          </div>
        `, "report-fluid-section")}

        ${detailSection("X. Chẩn đoán điều dưỡng - mục tiêu - can thiệp", detailDiagnosisGoalsInterventions(diagnoses, interventions), "report-care-plan-section")}

        ${detailSection("XI. Bàn giao", handoverItems.length || medicines.length
          ? `${detailCheckGroup("Việc cần tiếp tục theo dõi/thực hiện", handoverItems)}${detailHandoverMedicines(medicines)}`
          : `<div class="empty">Chưa có nội dung bàn giao.</div>`)}

        ${detailSection("XII. Tư vấn - hướng dẫn - giáo dục sức khỏe", renderGdskDetailDocument(educationForms, {
          patient: gdskPatientContext(selected),
          sheet,
        }), "report-health-education-section")}

        <footer class="report-signatures">
          <div><strong>Điều dưỡng ghi phiếu</strong><span>Ký, ghi rõ họ tên</span></div>
        </footer>
      </main>
    </div>
  `;
}

function nandaFocusSelectorForElement(element) {
  if (!element?.dataset) return "";
  if (element.dataset.nandaField) return `[data-nanda-field="${element.dataset.nandaField}"]`;
  if (element.dataset.nandaGoalIndex !== undefined) return `[data-nanda-goal-index="${element.dataset.nandaGoalIndex}"]`;
  if (element.dataset.nandaInterventionField) {
    return `[data-nanda-intervention-field="${element.dataset.nandaInterventionField}"][data-intervention-index="${element.dataset.interventionIndex}"]`;
  }
  if (element.dataset.nandaSearch !== undefined) return "[data-nanda-search]";
  return "";
}

function captureNandaFocus() {
  const active = document.activeElement;
  if (!active || !app.contains(active)) return null;
  const selector = nandaFocusSelectorForElement(active);
  if (!selector) return null;
  return {
    selector,
    start: typeof active.selectionStart === "number" ? active.selectionStart : null,
    end: typeof active.selectionEnd === "number" ? active.selectionEnd : null,
  };
}

function restoreNandaFocus(snapshot) {
  if (!snapshot?.selector) return;
  const focusTarget = app.querySelector(snapshot.selector);
  if (!focusTarget) return;
  focusTarget.focus();
  if (typeof focusTarget.setSelectionRange === "function") {
    const valueLength = focusTarget.value.length;
    const start = snapshot.start === null ? valueLength : Math.min(snapshot.start, valueLength);
    const end = snapshot.end === null ? valueLength : Math.min(snapshot.end, valueLength);
    focusTarget.setSelectionRange(start, end);
  }
}

function assessmentCardHeading(card) {
  return Array.from(card.children).find((child) => child.tagName === "H3");
}

function assessmentCardKey(card, index, heading) {
  const classKey = Array.from(card.classList)
    .find((className) => className.startsWith("assessment-field-") || className === "obgyn-assessment-card");
  const titleKey = searchKey(heading?.textContent || "");
  return `assessment-card:${index}:${classKey || titleKey || "section"}`;
}

function hydrateAssessmentAccordions() {
  if (state.activeCareFormTab !== "assessment") return;
  const cards = [...app.querySelectorAll(".structured-assessment .panel-body > .assessment-section-card")];
  cards.forEach((card, index) => {
    const existingHeader = card.querySelector(":scope > .assessment-card-head");
    const heading = existingHeader ? null : assessmentCardHeading(card);
    const key = card.dataset.assessmentCardKey || assessmentCardKey(card, index, heading || existingHeader);
    const isOpen = state.openAssessmentCards.has(key);
    card.dataset.assessmentCardKey = key;
    card.classList.add("assessment-collapsible-card");
    card.classList.toggle("is-open", isOpen);
    card.classList.toggle("is-collapsed", !isOpen);

    let header = existingHeader;
    if (!header) {
      header = document.createElement("div");
      header.className = "assessment-card-head";

      const titleButton = document.createElement("button");
      titleButton.type = "button";
      titleButton.className = "assessment-card-title";
      titleButton.dataset.action = "toggle-assessment-card";
      titleButton.dataset.assessmentCardKey = key;
      titleButton.innerHTML = heading ? heading.innerHTML : "Nhom nhan dinh";

      const collapseButton = document.createElement("button");
      collapseButton.type = "button";
      collapseButton.className = "assessment-card-collapse";
      collapseButton.dataset.action = "toggle-assessment-card";
      collapseButton.dataset.assessmentCardKey = key;

      header.append(titleButton, collapseButton);
      if (heading) {
        heading.replaceWith(header);
      } else {
        card.prepend(header);
      }
    }

    const buttons = header.querySelectorAll("[data-action='toggle-assessment-card']");
    buttons.forEach((button) => {
      button.dataset.assessmentCardKey = key;
      button.setAttribute("aria-expanded", String(isOpen));
    });
    const collapseButton = header.querySelector(".assessment-card-collapse");
    if (collapseButton) collapseButton.textContent = isOpen ? "\u1ea8n" : "M\u1edf";
  });
}

function render(focusSelector = "") {
  ensureSelection();
  if (state.screen === "patients") {
    app.innerHTML = renderPatientListScreen();
    return;
  }
  if (state.screen === "riskScales") {
    app.innerHTML = renderRiskScaleHomeScreen();
    return;
  }
  if (state.screen === "nanda") {
    const focusSnapshot = focusSelector ? { selector: focusSelector, start: null, end: null } : captureNandaFocus();
    app.innerHTML = renderNandaFormScreen();
    resizeNandaAutosizeTextareas();
    restoreNandaFocus(focusSnapshot);
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
      </div>

      <main class="layout">
        <section class="workspace care-tab-workspace">
          ${renderCareFormTabs()}
          <div class="care-tab-content">
            ${renderActiveCareFormTab(assessments)}
          </div>
        </section>
      </main>
    </div>
    ${state.activeScale ? renderScaleModal() : ""}
    ${state.activeFallRiskScalePicker ? renderFallRiskScalePickerModal() : ""}
    ${state.activeHealthEducationStage ? renderHealthEducationModal() : ""}
    ${state.handoverMedicineModalOpen ? renderHandoverMedicineModal() : ""}
    ${renderCareNandaDatalists()}
  `;

  hydrateAssessmentAccordions();

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

function careFormTabs() {
  return [
    { id: "patient", label: "Thông tin NB" },
    { id: "assessment", label: "Nhận định" },
    { id: "diagnosis", label: "Chẩn đoán" },
    { id: "intervention", label: "Can thiệp" },
    { id: "handover", label: "Bàn giao" },
    { id: "education", label: "TVHD GDSK" },
  ];
}

function renderCareFormTabs() {
  const activeTab = careFormTabs().some((tab) => tab.id === state.activeCareFormTab)
    ? state.activeCareFormTab
    : "patient";
  return `
    <nav class="care-form-tabs" aria-label="Các phần phiếu chăm sóc">
      ${careFormTabs().map((tab) => `
        <button
          type="button"
          class="care-form-tab ${activeTab === tab.id ? "active" : ""}"
          data-care-form-tab="${h(tab.id)}"
          aria-selected="${activeTab === tab.id ? "true" : "false"}"
        >${h(tab.label)}</button>
      `).join("")}
    </nav>
  `;
}

function renderActiveCareFormTab(assessments) {
  if (state.activeCareFormTab === "diagnosis" || state.activeCareFormTab === "intervention") {
    loadNandaRows();
    ensureDiagnosisCatalogLoaded({ renderOnComplete: true });
  }
  switch (state.activeCareFormTab) {
    case "assessment":
      return `${renderAssessmentPanel(assessments)}${renderFluidBalancePanel()}`;
    case "diagnosis":
      return renderDiagnosisPanelV2();
    case "intervention":
      return renderInterventionPanel();
    case "education":
      return renderHealthEducationPanel();
    case "handover":
      return renderHandoverPanel();
    case "patient":
    default:
      return renderPatientPanel();
  }
}

function renderPatientPanel() {
  return `${renderCareHeaderPanel()}${renderCareLevelPanel()}`;
}

function renderCareHeaderPanel() {
  const selected = patients[state.selectedPatientIndex] || patients[0];
  const info = currentCarePatientInfo();
  return `
    <section class="panel care-top-card">
      <div class="panel-header">
        <div>
          <h2 class="panel-title">Thông tin người bệnh</h2>
          <p class="panel-subtitle">${h(selected.name)} | Mã y tế: ${h(selected.code)} | ${h(selected.sex)} | ${selected.age} tuổi</p>
        </div>
      </div>
      <div class="panel-body">
        <div class="patient-detail-grid" aria-label="Thông tin người bệnh">
          ${patientDetail("Họ và tên", info.name)}
          ${patientDetail("Mã y tế", info.code)}
          ${patientDetail("Tuổi", info.age)}
          ${patientDetail("Giới", info.sex)}
          ${patientDetail("Ngày vào viện", info.date)}
          ${patientDetail("Phòng", info.room)}
          ${patientDetail("Giường", info.bed)}
          ${patientDetail("Khoa", info.department)}
          ${patientDetail("Chẩn đoán y khoa", info.diagnosis, "wide")}
        </div>
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
          ${state.assessmentChecklist.allergy === "yes" ? `
            <div class="allergy-detail-grid">
              ${checkField("allergyDrug", "Thuốc", state.assessmentChecklist.allergyDrug)}
              ${checkField("allergyFood", "Thức ăn", state.assessmentChecklist.allergyFood)}
              ${checkField("allergyOther", "Khác", state.assessmentChecklist.allergyOther)}
              ${checkField("allergySymptoms", "Biểu hiện", state.assessmentChecklist.allergySymptoms)}
            </div>
          ` : ""}
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

function patientDetail(label, value, variant = "") {
  return `
    <div class="patient-detail-item ${variant === "wide" ? "wide" : ""}">
      <span class="patient-detail-label">${h(label)}:</span>
      <span class="patient-detail-value">${h(value || "Chưa có")}</span>
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
          <h3>Toàn thân</h3>
          <div class="assessment-form compact-form">
            ${radioGroup("bodyType", "Thể trạng", ["Gầy", "Trung bình", "Béo"], check.bodyType)}
            ${multiCheckGroup("consciousness", "Ý thức", ["Tỉnh", "Lơ mơ", "Hôn mê", "Kích thích", "An thần"], check.consciousness)}
            ${multiCheckGroup("mucosa", "Da niêm mạc", ["Hồng", "Nhợt", "Vàng da", "Ngứa ngoài da"], check.mucosa)}
            ${radioGroup("edema", "Phù", ["Có", "Không"], check.edema)}
            ${checkArea("systemicNote", "Khác", check.systemicNote)}
          </div>
        </div>

        <div class="assessment-section-card respiratory-section">
          <h3>Hô hấp</h3>
          <div class="assessment-form compact-form respiratory-form">
            ${radioGroup("breathingMode", "Tình trạng thở", ["Tự thở", "Thở oxy", "HFNC", "NIV", "Thở máy"], check.breathingMode)}
            ${checkField("respiratoryRate", "Nhịp thở (lần/phút)", check.respiratoryRate, "text", "respiratory-rate-field")}
            ${checkArea("respiratoryNote", "Khác", check.respiratoryNote, "respiratory-note-field")}
            ${renderRespiratoryDetails(check)}
            ${multiCheckGroup("coughStatus", "Ho", ["Không ho", "Ho khan", "Ho có đờm", "Ho từng cơn", "Ho thường xuyên", "Ho có máu", "Ho yếu / không hiệu quả", "Không đánh giá được"], check.coughStatus)}
          </div>
        </div>

        <div class="assessment-section-card">
          <h3>Tuần hoàn</h3>
          <div class="assessment-form compact-form circulation-form">
            ${multiCheckGroup("circulationSymptoms", "Triệu chứng cơ năng", ["Không triệu chứng", "Hồi hộp/đánh trống ngực", "Đau ngực", "Chóng mặt", "Ngất", "Không đánh giá được"], check.circulationSymptoms)}
            ${radioGroup("peripheralPerfusion", "Tưới máu ngoại vi", ["Bình thường", "Giảm tưới máu ngoại vi"], check.peripheralPerfusion)}
            ${radioGroup("heartRhythm", "Nhịp tim", ["Đều", "Không đều"], check.heartRhythm)}
            ${radioGroup("heartRateStatus", "Mạch", ["Bình thường", "Nhanh", "Chậm"], check.heartRateStatus)}
            ${radioGroup("heartSounds", "Tiếng tim", ["Nghe rõ", "Mờ", "Không đánh giá được"], check.heartSounds)}
            ${checkBool("circulationOtherChecked", "Khác", check.circulationOtherChecked)}
            ${check.circulationOtherChecked ? checkField("circulationOther", "Khác", check.circulationOther, "text", "circulation-other-field") : ""}
          </div>
        </div>

        <div class="assessment-section-card">
          <h3>Thần kinh cảm giác</h3>
          <div class="assessment-form compact-form">
            ${multiCheckGroup("neuroConsciousness", "Ý thức", ["Bình thường", "Lơ mơ", "Ngủ gà", "Kích thích", "Hôn mê", "Khác"], check.neuroConsciousness)}
            ${Array.isArray(check.neuroConsciousness) && check.neuroConsciousness.includes("Khác") ? checkField("neuroConsciousnessOther", "Ý thức khác", check.neuroConsciousnessOther) : ""}
            ${radioGroup("neuroOrientation", "Định hướng", ["Bình thường", "Rối loạn định hướng thời gian", "Rối loạn định hướng không gian", "Rối loạn định hướng bản thân", "Khác"], check.neuroOrientation)}
            ${check.neuroOrientation === "Khác" ? checkField("neuroOrientationOther", "Định hướng khác", check.neuroOrientationOther) : ""}
            ${normalOrMultiCheckGroup("neuroBehaviorStatus", "neuroBehavior", "Tri giác - hành vi", ["Kích thích", "Vật vã", "Lo âu", "Không hợp tác", "Rối loạn hành vi", "Ảo giác", "Lú lẫn", "Khác"], check.neuroBehaviorStatus, check.neuroBehavior)}
            ${Array.isArray(check.neuroBehavior) && check.neuroBehavior.includes("Khác") ? checkField("neuroBehaviorOther", "Tri giác - hành vi khác", check.neuroBehaviorOther) : ""}
            ${multiCheckGroup("neuroFocalSigns", "Dấu hiệu thần kinh khu trú", ["Bình thường", "Méo miệng", "Nói khó", "Nuốt khó", "Liệt dây thần kinh sọ", "Giảm phản xạ", "Tăng phản xạ gân xương", "Co giật", "Đồng tử bất thường", "Khác"], check.neuroFocalSigns)}
            ${Array.isArray(check.neuroFocalSigns) && check.neuroFocalSigns.includes("Khác") ? checkField("neuroFocalSignsOther", "Dấu hiệu thần kinh khu trú khác", check.neuroFocalSignsOther) : ""}
          </div>
        </div>

        <div class="assessment-section-card">
          <h3>Tiêu hóa</h3>
          <div class="assessment-form compact-form digestive-form">
            ${radioGroup("abdomen", "Bụng", ["Mềm", "Chướng", "Có dẫn lưu"], check.abdomen)}
            ${multiCheckGroup("painLocation", "Vị trí đau", ["Không đau", "Thượng vị", "Quanh rốn", "Hạ vị", "Hố chậu phải", "Hố chậu trái", "Hạ sườn phải", "Hạ sườn trái", "Mạng sườn phải", "Mạng sườn trái", "Đau toàn bụng", "Đau vị trí vết mổ", "Khác"], check.painLocation)}
            ${Array.isArray(check.painLocation) && check.painLocation.includes("Khác") ? checkField("painLocationOther", "Vị trí đau khác", check.painLocationOther) : ""}
            ${multiCheckGroup("painCharacter", "Tính chất đau", ["Âm ỉ", "Dữ dội", "Quặn từng cơn", "Đau liên tục", "Đau tăng khi ho/vận động", "Đau sau ăn", "Đau khi ấn", "Phản ứng thành bụng", "Đau lan ra sau lưng", "Đau lan lên vai phải", "Khác"], check.painCharacter)}
            ${Array.isArray(check.painCharacter) && check.painCharacter.includes("Khác") ? checkField("painCharacterOther", "Tính chất đau khác", check.painCharacterOther) : ""}
            ${multiCheckGroup("nauseaVomiting", "Nôn/Buồn nôn", ["Không", "Buồn nôn", "Nôn khan", "Nôn ra thức ăn", "Nôn dịch vàng/xanh", "Nôn máu", "Nôn nhiều lần", "Khác"], check.nauseaVomiting)}
            ${Array.isArray(check.nauseaVomiting) && check.nauseaVomiting.includes("Khác") ? checkField("nauseaVomitingOther", "Nôn/Buồn nôn khác", check.nauseaVomitingOther) : ""}
            ${multiCheckGroup("flatus", "Trung tiện", ["Có", "Chưa", "Bí trung tiện", "Trung tiện ít", "Trung tiện nhiều", "Khác"], check.flatus)}
            ${Array.isArray(check.flatus) && check.flatus.includes("Khác") ? checkField("flatusOther", "Trung tiện khác", check.flatusOther) : ""}
            ${multiCheckGroup("stool", "Đại tiện", ["Bình thường", "Chưa đại tiện", "Táo bón", "Tiêu chảy", "Phân lỏng", "Phân đen", "Phân máu", "Khác"], check.stool)}
            ${Array.isArray(check.stool) && check.stool.includes("Khác") ? checkField("stoolOther", "Đại tiện khác", check.stoolOther) : ""}
          </div>
        </div>

        <div class="assessment-section-card">
          <h3>Bài tiết</h3>
          <div class="assessment-form compact-form">
            ${multiCheckGroup("urinary", "Bài tiết nước tiểu", ["Tự đi tiểu", "Tiểu qua sonde", "Thiểu niệu", "Đa niệu", "Vô niệu"], check.urinary)}
            ${checkField("urineAmount", "Số lượng nước tiểu (ml)", check.urineAmount)}
          </div>
        </div>

        <div class="assessment-section-card">
          <h3>Dinh dưỡng</h3>
          <div class="assessment-form compact-form">
            ${multiCheckGroup("nutritionRoute", "Đường nuôi dưỡng", ["Đường miệng", "Sonde dạ dày", "Sonde hỗng tràng", "Tĩnh mạch", "Kết hợp", "Nhịn ăn"], check.nutritionRoute)}
            ${multiCheckGroup("nutritionRegimen", "Chế độ dinh dưỡng", ["Cơm", "Cháo", "Soup", "Sữa", "Khác"], check.nutritionRegimen)}
            ${Array.isArray(check.nutritionRegimen) && check.nutritionRegimen.includes("Khác") ? checkField("nutritionRegimenOther", "Chế độ dinh dưỡng khác", check.nutritionRegimenOther) : ""}
            ${checkBool("pathologicalDiet", "Chế độ bệnh lý", check.pathologicalDiet)}
            ${check.pathologicalDiet ? multiCheckGroup("pathologicalDietTypes", "Loại chế độ bệnh lý", ["Tim mạch", "Đái tháo đường (kiểm soát đường)", "Suy thận", "Gan mật", "Giảm mỡ / tim mạch", "Theo chỉ định riêng", "Khác"], check.pathologicalDietTypes) : ""}
            ${check.pathologicalDiet && Array.isArray(check.pathologicalDietTypes) && check.pathologicalDietTypes.includes("Khác") ? checkField("pathologicalDietOther", "Chế độ bệnh lý khác", check.pathologicalDietOther) : ""}
          </div>
        </div>

        <div class="assessment-section-card">
          <h3>Vận động/Phục hồi chức năng</h3>
          <div class="assessment-form compact-form mobility-rehab-form">
            ${multiCheckGroup("mobilityAbility", "Khả năng vận động", ["Tự đi lại bình thường", "Đi lại cần hỗ trợ", "Đi lại bằng dụng cụ hỗ trợ", "Không tự đi lại được", "Nằm bất động tại giường", "Khác"], check.mobilityAbility)}
            ${Array.isArray(check.mobilityAbility) && check.mobilityAbility.includes("Khác") ? checkField("mobilityAbilityOther", "Khả năng vận động khác", check.mobilityAbilityOther) : ""}
            ${multiCheckGroup("muscleStrength", "Tình trạng cơ lực", ["Cơ lực bình thường", "Yếu nhẹ", "Yếu 1 chi", "Yếu 2 chi", "Liệt nửa người", "Liệt tứ chi", "Khác"], check.muscleStrength)}
            ${Array.isArray(check.muscleStrength) && check.muscleStrength.includes("Khác") ? checkField("muscleStrengthOther", "Tình trạng cơ lực khác", check.muscleStrengthOther) : ""}
            ${multiCheckGroup("movementStatus", "Tình trạng vận động", ["Bình thường", "Hạn chế vận động", "Đau khi vận động", "Co cứng cơ", "Run tay chân", "Giảm thăng bằng", "Khác"], check.movementStatus)}
            ${Array.isArray(check.movementStatus) && check.movementStatus.includes("Khác") ? checkField("movementStatusOther", "Tình trạng vận động khác", check.movementStatusOther) : ""}
          </div>
        </div>

        <div class="assessment-section-card">
          <h3>Cơ quan bị bệnh</h3>
          ${renderDiseasedOrganDropdown()}
        </div>

        <div class="assessment-section-card">
          <h3>Thang điểm đánh giá</h3>
          <div class="assessment-form compact-form">
            ${renderScaleCheckItem("fallRiskAssessment", "Đánh giá nguy cơ té ngã (Morse)", check.fallRiskAssessment)}
            ${renderScaleCheckItem("vteRiskAssessment", "Đánh giá mức độ viêm tĩnh mạch (VIP)", check.vteRiskAssessment)}
            ${renderScaleCheckItem("painAssessment", "Đánh giá đau (VAS)", check.painAssessment)}
            ${renderScaleCheckItem("pressureUlcerRiskAssessment", "Đánh giá nguy cơ loét tỳ đè (Braden)", check.pressureUlcerRiskAssessment)}
            ${renderScaleCheckItem("glasgowAssessment", "Đánh giá Glasgow (GCS)", check.glasgowAssessment)}
          </div>
        </div>

        ${renderObgynAssessmentPanel()}

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

function obgynFieldKey(id) {
  return `obgyn_${id}`;
}

function selectedObgynSections() {
  const sections = state.obgynTemplate?.sections || [];
  if (state.assessmentChecklist.obgynMode === "obstetric") {
    return sections.filter((section) => ["truoc_sinh", "trong_va_sau_khi_sinh"].includes(section.id));
  }
  if (state.assessmentChecklist.obgynMode === "gynecology") {
    return sections.filter((section) => section.id === "nguoi_benh_phu_khoa");
  }
  return [];
}

function clearObgynFieldValues(fields = []) {
  fields.forEach((fieldDef) => {
    if (fieldDef.type === "group" || fieldDef.type === "object") {
      clearObgynFieldValues(fieldDef.fields || []);
      return;
    }
    delete state.assessmentChecklist[obgynFieldKey(fieldDef.id)];
  });
}

function clearHiddenObgynValues() {
  const visibleIds = new Set(selectedObgynSections().map((section) => section.id));
  (state.obgynTemplate?.sections || [])
    .filter((section) => !visibleIds.has(section.id))
    .forEach((section) => clearObgynFieldValues(section.fields || []));
}

function obgynSectionTitle(title = "") {
  return title.replace(/^[IVXLCDM]+\.\s*/i, "");
}

function renderObgynAssessmentPanel() {
  const check = state.assessmentChecklist;
  const enabled = Boolean(check.obgynEnabled);
  return `
    <div class="assessment-section-card obgyn-assessment-card">
      <h3>Sản phụ khoa</h3>
      <div class="obgyn-toggle">${checkBool("obgynEnabled", "Nhận định sản phụ khoa", enabled)}</div>
      ${enabled ? `
        <div class="obgyn-mode-buttons" aria-label="Loại nhận định sản phụ khoa">
          <button type="button" class="btn obgyn-mode-btn ${check.obgynMode === "obstetric" ? "active" : ""}" data-obgyn-mode="obstetric">Sản khoa</button>
          <button type="button" class="btn obgyn-mode-btn ${check.obgynMode === "gynecology" ? "active" : ""}" data-obgyn-mode="gynecology">Phụ khoa</button>
        </div>
        ${check.obgynMode ? renderSelectedObgynSections() : `<div class="section-hint">Chọn Sản khoa hoặc Phụ khoa để nhập nhận định.</div>`}
      ` : ""}
    </div>
  `;
}

function renderSelectedObgynSections() {
  if (!state.obgynTemplate) return `<div class="section-hint">Chưa tải được dữ liệu nhận định sản phụ khoa.</div>`;
  return `
    <div class="obgyn-subsections">
      ${selectedObgynSections().map((section) => `
        <div class="obgyn-subsection">
          <h4>${h(obgynSectionTitle(section.title))}</h4>
          <div class="assessment-form compact-form obgyn-form">
            ${(section.fields || []).map((field) => renderObgynField(field)).join("")}
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function renderObgynField(fieldDef) {
  const key = obgynFieldKey(fieldDef.id);
  if (fieldDef.type === "group" || fieldDef.type === "object") {
    return `
      <div class="assessment-full obgyn-field-group">
        <h5>${h(fieldDef.label)}</h5>
        <div class="assessment-form compact-form obgyn-form">
          ${(fieldDef.fields || []).map((field) => renderObgynField(field)).join("")}
        </div>
      </div>
    `;
  }
  if (fieldDef.type === "checkbox") {
    return multiCheckGroup(key, fieldDef.label, fieldDef.options || [], state.assessmentChecklist[key] || []);
  }
  return checkField(key, fieldDef.label, state.assessmentChecklist[key] || "", fieldDef.type || "text");
}

function renderDiseasedOrganDropdown() {
  const selected = diseasedOrganSelectedItems();
  const query = state.activeDiseasedOrganSuggest ? state.diseasedOrganQuery : (state.diseasedOrganQuery || selected.join("; "));
  const options = state.activeDiseasedOrganSuggest ? diseasedOrganOptions(state.diseasedOrganQuery) : [];
  const selectedSet = new Set(selected.map(searchKey));
  const hasExactOption = options.some((item) => searchKey(item.nanda) === searchKey(state.diseasedOrganQuery));
  const customValue = cleanLine(state.diseasedOrganQuery);
  const hasSelectedCustom = selectedSet.has(searchKey(customValue));
  const isCatalogPending = state.activeDiseasedOrganSuggest && state.diagnosisCatalogLoading;
  const showAdd = state.activeDiseasedOrganSuggest && !isCatalogPending && customValue && !hasSelectedCustom && !hasExactOption;
  return `
    <div class="field diagnosis-search-field">
      <label>Nhận định cơ quan bị bệnh</label>
      <div class="diagnosis-combobox">
        <input type="search" value="${h(query)}" placeholder="Nhập keyword nguyên nhân..." data-diseased-organ-query ${inputNextAttrs("search")} />
        <button type="button" class="diagnosis-dropdown-toggle" data-action="toggle-diseased-organ-dropdown" aria-label="Hiển thị danh sách nhận định cơ quan bị bệnh">▼</button>
      </div>
      ${state.activeDiseasedOrganSuggest ? `
        <div class="suggestion-list diagnosis-dropdown-list" data-diseased-organ-list>
          ${isCatalogPending ? renderDiagnosisCatalogStatus() : options.length ? options.map((item) => `
            <label class="diagnosis-dropdown-option">
              <input type="checkbox" ${selectedSet.has(searchKey(item.nanda)) ? "checked" : ""} data-diseased-organ-check data-value="${h(item.nanda)}" />
              <span>
                <strong>${h(item.nanda)}</strong>
                ${renderSuggestionLines(item.causes.slice(0, 3).join("; "))}
              </span>
            </label>
          `).join("") : `<div class="diagnosis-dropdown-empty">Không có nhận định phù hợp.</div>`}
          ${showAdd ? `
            <label class="diagnosis-dropdown-option suggestion-add-new">
              <input type="checkbox" data-diseased-organ-custom-check data-value="${h(state.diseasedOrganQuery)}" />
              <span>
                <strong>Thêm mới nhận định</strong>
                <em>${h(state.diseasedOrganQuery)}</em>
              </span>
            </label>
          ` : ""}
        </div>
      ` : ""}
    </div>
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

function normalOrMultiCheckGroup(statusKey, multiKey, label, options, statusValue, multiValue = []) {
  const selected = Array.isArray(multiValue) ? multiValue : multiValue ? [multiValue] : [];
  return `
    <fieldset class="assessment-radio">
      <legend>${h(label)}</legend>
      <div>
        <label>
          <input type="radio" name="${h(statusKey)}" value="Bình thường" ${statusValue === "Bình thường" ? "checked" : ""} data-checklist-radio="${h(statusKey)}" />
          <span>Bình thường</span>
        </label>
        ${options
          .map((option) => `
            <label>
              <input type="checkbox" value="${h(option)}" ${selected.includes(option) ? "checked" : ""} data-checklist-multi="${h(multiKey)}" />
              <span>${h(option)}</span>
            </label>
          `)
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
  if (isFallRiskScaleKey(key) && state.scaleScores[key]?._scaleType === "humpty") return HUMPTY_DUMPTY_SCALE;
  if (isFallRiskScaleKey(key) && state.scaleScores[key]?._scaleType === "ofras") return OFRAS_SCALE;
  const scaleId = scaleMapping[key];
  return state.scaleData.find((s) => s.id === scaleId) || null;
}

function isVasPainScale(scale) {
  return scale?.id === "vas_pain_score" && scale.scale && Array.isArray(scale.levels);
}

function vasLevelForScore(scale, score) {
  const value = Number(score);
  if (!Number.isFinite(value)) return null;
  return (scale.levels || []).find((level) => value >= level.min && value <= level.max) || null;
}

function calculateScaleResult(key) {
  const scale = getScaleForKey(key);
  if (!scale) return null;
  if (scale.multiSelect) {
    const scores = state.scaleScores[key] || {};
    let total = 0;
    let allFilled = true;
    let hasItemScore3 = false;
    for (const item of scale.items || []) {
      const values = Array.isArray(scores[item.key]) ? scores[item.key] : [];
      if (!values.length) {
        allFilled = false;
        continue;
      }
      values.forEach((value) => {
        const score = Number(String(value).split(":").pop());
        if (Number.isFinite(score)) {
          total += score;
          if (score === 3) hasItemScore3 = true;
        }
      });
    }
    let risk = "";
    if (allFilled) {
      if (total >= 5 || hasItemScore3) risk = "Nguy cơ cao";
      else if (total >= 3) risk = "Nguy cơ trung bình";
      else risk = "Nguy cơ thấp";
    }
    const riskClass = risk.includes("cao") ? "risk-high" : risk.includes("trung bình") ? "risk-medium" : "risk-low";
    return {
      total,
      risk,
      riskClass,
      allFilled,
      scaleId: scale.id,
      scaleName: scale.name,
      recommendation: hasItemScore3 && total < 5 ? "Có bất kỳ tiêu chí nào đạt mức 3 điểm đơn lẻ." : "",
    };
  }
  if (isVasPainScale(scale)) {
    const score = Number(state.scaleScores[key]?.vas);
    const min = Number(scale.validation?.minValue ?? scale.scale.min ?? 0);
    const max = Number(scale.validation?.maxValue ?? scale.scale.max ?? 10);
    const allFilled = Number.isFinite(score) && score >= min && score <= max;
    const level = allFilled ? vasLevelForScore(scale, score) : null;
    const risk = level?.label || "";
    let riskClass = "risk-low";
    if (level?.color === "red") riskClass = "risk-very-high";
    else if (level?.color === "orange") riskClass = "risk-medium";
    else if (level?.color === "lime") riskClass = "risk-low";
    return {
      total: allFilled ? score : 0,
      risk,
      riskClass,
      allFilled,
      recommendation: level?.recommendation || "",
      color: level?.color || "",
    };
  }
  if (!scale.items) return null;
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

function renderVasPainScaleBody(key, scale, result) {
  const min = Number(scale.scale.min ?? 0);
  const max = Number(scale.scale.max ?? 10);
  const step = Number(scale.scale.step ?? 1);
  const unit = scale.scale.unit || "điểm";
  const rawValue = state.scaleScores[key]?.vas;
  const value = rawValue === undefined || rawValue === "" ? min : Number(rawValue);
  return `
    <div class="scale-vas-image-wrap">
      <img
        src="https://file.hstatic.net/200000740871/article/g-danh-gia-thang-diem-dau-vas_-dung-thuoc-giam-dau-theo-thang-diem-vas_b9edbad338da491daf3cb9666848576e_1024x1024.jpg"
        alt="Bảng đánh giá thang điểm đau VAS"
        class="scale-vas-image"
      />
    </div>
    <div class="vas-scale-control">
      <label class="assessment-field">
        <span>Điểm đau VAS (${h(unit)})</span>
        <input type="number" min="${min}" max="${max}" step="${step}" value="${h(value)}" data-vas-scale="${h(key)}" />
      </label>
      <input class="vas-range" type="range" min="${min}" max="${max}" step="${step}" value="${h(value)}" data-vas-scale="${h(key)}" />
      <div class="vas-ticks">
        ${Array.from({ length: max - min + 1 }, (_, index) => `<span>${min + index}</span>`).join("")}
      </div>
    </div>
    ${result?.allFilled && result.risk ? `
      <div class="vas-result-card ${h(result.riskClass)}">
        <strong>${h(result.risk)} - ${result.total} ${h(unit)}</strong>
        ${result.recommendation ? `<span>${h(result.recommendation)}</span>` : ""}
      </div>
    ` : ""}
  `;
}

function renderMultiSelectScaleBody(key, scale, scores) {
  return `
    <p class="scale-rule">Quy tắc: ${h(scale.totalScoreRule)}</p>
    ${scale.items.map((item) => {
      const selected = Array.isArray(scores[item.key]) ? scores[item.key].map(String) : [];
      const groupTotal = selected.reduce((sum, value) => sum + Number(String(value).split(":").pop()), 0);
      return `
        <fieldset class="scale-fieldset">
          <legend>${h(item.label)} <span class="ofras-group-score">${groupTotal} điểm</span></legend>
          <div class="scale-options">
            ${item.options.map((opt, optionIndex) => {
              const optionValue = `${optionIndex}:${opt.score}`;
              const checked = selected.includes(optionValue);
              return `
                <label class="scale-option ${checked ? "selected" : ""}">
                  <input type="checkbox" value="${h(optionValue)}" ${checked ? "checked" : ""} data-scale-multi-item="${h(key)}:${h(item.key)}" />
                  <span class="scale-option-label">${h(opt.label)}</span>
                  <span class="scale-option-score">${opt.score}</span>
                </label>
              `;
            }).join("")}
          </div>
        </fieldset>
      `;
    }).join("")}
  `;
}

function isFallRiskScaleKey(key) {
  return key === "fallRiskAssessment" || key === "fall_risk_score";
}

function openFallRiskScalePicker(key) {
  state.activeFallRiskScalePicker = key;
  state.activeScale = null;
}

function startFallRiskScale(type) {
  const key = state.activeFallRiskScalePicker || "fallRiskAssessment";
  if (!state.scaleScores[key]) state.scaleScores[key] = {};
  state.scaleScores[key]._scaleType = type === "ofras" ? "ofras" : type === "humpty" ? "humpty" : "morse";
  if (type === "ofras") {
    OFRAS_SCALE.items.forEach((item) => {
      if (!Array.isArray(state.scaleScores[key][item.key])) state.scaleScores[key][item.key] = ["0:0"];
    });
  } else if (type === "humpty") {
    HUMPTY_DUMPTY_SCALE.items.forEach((item) => {
      if (state.scaleScores[key][item.key] === undefined) {
        const defaultOption = item.options[item.options.length - 1];
        state.scaleScores[key][item.key] = defaultOption.score;
      }
    });
  }
  state.activeFallRiskScalePicker = null;
  state.activeScale = key;
}

function renderFallRiskScalePickerModal() {
  const key = state.activeFallRiskScalePicker || "fallRiskAssessment";
  const hasMorse = Boolean(getScaleForKey(key));
  return `
    <div class="scale-modal-overlay" data-action="close-fall-risk-picker-overlay">
      <div class="scale-modal fall-risk-picker-modal">
        <div class="scale-modal-header">
          <h2>Đánh giá nguy cơ té ngã</h2>
          <button class="scale-modal-close" data-action="close-fall-risk-picker">✕</button>
        </div>
        <div class="scale-modal-body fall-risk-picker-body">
          <section class="fall-risk-scale-section">
            <h3>Chọn thang điểm</h3>
            <div class="fall-risk-scale-buttons">
              <button type="button" class="fall-risk-scale-btn" data-action="select-fall-risk-scale" data-fall-risk-scale="morse" ${hasMorse ? "" : "disabled"}>Thang điểm Morse (Người lớn)</button>
              <button type="button" class="fall-risk-scale-btn" data-action="select-fall-risk-scale" data-fall-risk-scale="humpty">Thang điểm Humpty Dumpty (Trẻ em)</button>
              <button type="button" class="fall-risk-scale-btn" data-action="select-fall-risk-scale" data-fall-risk-scale="ofras">Thang điểm OFRAS (sản khoa)</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  `;
}

function renderScaleModal() {
  const key = state.activeScale;
  const scale = getScaleForKey(key);
  if (!scale) return "";
  const scores = state.scaleScores[key] || {};
  const result = calculateScaleResult(key);
  const isVas = isVasPainScale(scale);
  const isMulti = Boolean(scale.multiSelect);
  return `
    <div class="scale-modal-overlay" data-action="close-scale-overlay">
      <div class="scale-modal">
        <div class="scale-modal-header">
          <h2>${h(scale.name)}</h2>
          <button class="scale-modal-close" data-action="close-scale">✕</button>
        </div>
        <div class="scale-modal-body">
          ${isVas ? renderVasPainScaleBody(key, scale, result) : isMulti ? renderMultiSelectScaleBody(key, scale, scores) : `
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
          `}
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

function renderDiagnosisPanelV2() {
  return `
    <section class="panel">
      <div class="panel-header">
        <div>
          <h2 class="panel-title">Chẩn đoán điều dưỡng & mục tiêu</h2>
        </div>
        <span class="step-badge">3</span>
      </div>
      <div class="panel-body">
        <div class="diagnosis-grid">
          ${state.diagnosisRows.map((row, index) => renderDiagnosisRowV2(row, index)).join("")}
        </div>
        <button class="btn primary" style="margin-top: 12px;" data-action="save-diagnosis-row">Lưu</button>
        ${renderSavedDiagnosisRows()}
      </div>
    </section>
    ${state.diagnosisPicker ? renderDiagnosisPickerModal() : ""}
  `;
}

function renderDiagnosisAiTools() {
  return `
    <div class="diagnosis-ai-tools" aria-label="Tro ly AI ho tro tao chan doan dieu duong">
      <span>Tr&#7907; l&#253; AI h&#7895; tr&#7907; t&#7841;o ch&#7849;n &#273;o&#225;n &#273;i&#7873;u d&#432;&#7905;ng</span>
      <div>
        <a class="btn primary diagnosis-ai-link" href="https://notebooklm.google.com/notebook/314859a7-bf0c-4889-81b5-3f459f124cef" target="_blank" rel="noopener noreferrer">NotebookLM</a>
      </div>
    </div>
  `;
}

function renderNandaAutoFillBox() {
  const rows = state.nandaAutoFillRows || [];
  return `
    <div class="nanda-autofill-box">
      <label for="nanda-autofill-text">D&#225;n b&#7843;ng t&#7915; NotebookLM</label>
      <textarea id="nanda-autofill-text" data-nanda-autofill-text placeholder="Nh&#243;m v&#7845;n &#273;&#7873; | V&#7845;n &#273;&#7873; | Nguy&#234;n nh&#226;n | M&#7909;c ti&#234;u | Can thi&#7879;p | M&#227;">${h(state.nandaAutoFillText)}</textarea>
      <div class="nanda-autofill-actions">
        <button type="button" class="btn primary" data-action="apply-nanda-autofill">T&#7921; &#273;&#7897;ng &#273;i&#7873;n</button>
        <button type="button" class="btn ghost" data-action="clear-nanda-autofill">X&#243;a n&#7897;i dung</button>
      </div>
      ${state.nandaAutoFillError ? `<div class="nanda-autofill-error">${h(state.nandaAutoFillError)}</div>` : ""}
      ${rows.length ? `
        <div class="nanda-autofill-preview">
          <strong>&#272;&#227; nh&#7853;n ${rows.length} d&#242;ng. D&#242;ng &#273;&#7847;u &#273;&#227; &#273;i&#7873;n v&#224;o form.</strong>
          <div>
            ${rows.map((row, index) => `
              <button type="button" class="btn" data-action="apply-nanda-autofill-row" data-row-index="${index}">
                ${index + 1}. ${h(row.van_de || row.nhom_van_de || "D&#242;ng")} ${row.nguyen_nhan ? `- ${h(row.nguyen_nhan)}` : ""}
              </button>
            `).join("")}
          </div>
        </div>
      ` : ""}
    </div>
  `;
}

function splitNandaAutoFillLine(line) {
  const value = cleanLine(line);
  if (!value) return [];
  if (/^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?$/.test(value)) return [];
  if (value.includes("|")) {
    const parts = value.split("|").map((item) => cleanLine(item));
    if (!parts[0]) parts.shift();
    if (!parts[parts.length - 1]) parts.pop();
    return parts;
  }
  if (value.includes("\t")) return value.split("\t").map((item) => cleanLine(item));
  return [];
}

function nandaAutoFillColumnKey(label) {
  const key = searchKey(label);
  if (!key) return "";
  if (key.includes("khoa")) return "khoa";
  if (key.includes("nhom") && key.includes("van de")) return "nhom_van_de";
  if ((key.includes("van de") && !key.includes("nhom")) || key.includes("chan doan")) return "van_de";
  if (key.includes("nguyen nhan") || key.includes("yeu to lien quan")) return "nguyen_nhan";
  if (key.includes("muc tieu")) return "muc_tieu_can_thiep";
  if (key === "ma" || key.includes("ma can thiep") || key.includes("ma tham khao")) return "ma_can_thiep";
  if (key.includes("can thiep") || key.includes("noi dung") || key.includes("hoat dong cham soc")) return "noi_dung_can_thiep";
  return "";
}

function parseNandaAutoFillText(text) {
  const tableRows = String(text || "")
    .split(/\r?\n/)
    .map(splitNandaAutoFillLine)
    .filter((columns) => columns.length);
  if (!tableRows.length) return [];

  const defaultKeys = [
    "nhom_van_de",
    "van_de",
    "nguyen_nhan",
    "muc_tieu_can_thiep",
    "noi_dung_can_thiep",
    "ma_can_thiep",
  ];
  const firstRowKeys = tableRows[0].map(nandaAutoFillColumnKey);
  const hasHeader = firstRowKeys.filter(Boolean).length >= 2;
  const keys = hasHeader ? firstRowKeys : defaultKeys;
  const dataRows = (hasHeader ? tableRows.slice(1) : tableRows).filter((columns) => columns.length >= 6);

  return dataRows
    .map((columns) => {
      const row = createDefaultNandaForm();
      columns.forEach((value, index) => {
        const field = keys[index];
        if (field) row[field] = cleanLine(value);
      });
      return row;
    })
    .filter((row) => cleanLine(row.nhom_van_de) || cleanLine(row.van_de) || cleanLine(row.nguyen_nhan) || cleanLine(row.noi_dung_can_thiep));
}

function applyNandaAutoFillRow(row) {
  const currentDepartment = cleanLine(state.nandaForm.khoa);
  state.nandaEditingId = null;
  state.nandaForm = {
    ...createDefaultNandaForm(),
    ...normalizeNandaPayload(row),
    khoa: cleanLine(row.khoa) || currentDepartment,
  };
}

function renderSavedDiagnosisRows() {
  const rows = state.diagnosisSavedRows || [];
  if (!rows.length) return "";
  return `
    <div class="saved-diagnosis-list">
      <strong>Chẩn đoán và mục tiêu đã lưu</strong>
      <ol>
        ${rows.map((row, index) => `
          <li class="saved-diagnosis-item">
            <div>
              <div><b>${h(row.diagnosis)}</b>${row.causes?.length ? ` liên quan tới ${h(row.causes.join("; "))}` : ""}</div>
              ${row.goals?.length ? `
                <div class="saved-diagnosis-goals">
                  ${row.goals.map((goal, goalIndex) => `
                    <div><b>Mục tiêu ${goalIndex + 1}:</b> ${h(goal)}</div>
                  `).join("")}
                </div>
              ` : ""}
            </div>
            <button type="button" class="remove-row-btn" data-action="remove-saved-diagnosis" data-index="${index}">Xóa</button>
          </li>
        `).join("")}
      </ol>
    </div>
  `;
}

function htmlFromRendered(renderedHtml, selector) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = renderedHtml;
  return wrapper.querySelector(selector)?.innerHTML || "";
}

function replaceDropdownHtml(selector, html) {
  const node = app.querySelector(selector);
  if (node) node.innerHTML = html;
}

function refreshDiagnosisDropdown(index, listName) {
  const row = state.diagnosisRows[Number(index)];
  if (!row) return;
  const selector = `[data-${listName}-list="${index}"]`;
  replaceDropdownHtml(selector, htmlFromRendered(renderDiagnosisRowV2(row, Number(index)), selector));
}

function refreshDiseasedOrganDropdown() {
  const selector = "[data-diseased-organ-list]";
  replaceDropdownHtml(selector, htmlFromRendered(renderDiseasedOrganDropdown(), selector));
}

function refreshInterventionDropdown(kind) {
  const selector = `[data-iv-list="${kind}"]`;
  replaceDropdownHtml(selector, htmlFromRendered(renderInterventionPanel(), selector));
}

function renderDiagnosisRowV2(row, index) {
  const causes = causeOptionsForDiagnosis(row);
  const goals = goalOptionsForDiagnosisRow(row);
  const causeOptions = state.activeCauseSuggest === index ? filteredCauseOptionsForDiagnosis(row) : [];
  const goalOptions = state.activeGoalSuggest === `goal:${index}` ? filteredGoalOptionsForDiagnosis(row) : [];
  const selectedGoals = new Set(row.goals || []);
  const query = row.diagnosisQuery || row.diagnosis || "";
  const causeQuery = row.causeQuery || "";
  const causeInputValue = state.activeCauseSuggest === index ? causeQuery : (causeQuery || (row.causes || []).join("; "));
  const goalQuery = row.goalQuery || "";
  const goalInputValue = state.activeGoalSuggest === `goal:${index}` ? goalQuery : (goalQuery || (row.goals || []).join("; "));
  const diagnosisOptions = state.activeDiagnosisSuggest === index ? nandaCatalogOptions(query) : [];
  const hasExactDiagnosisOption = diagnosisOptions.some((item) => searchKey(item.nanda) === searchKey(query));
  const diagnosisLoading = state.activeDiagnosisSuggest === index && state.diagnosisCatalogLoading;
  const showAddDiagnosisOption = state.activeDiagnosisSuggest === index && !diagnosisLoading && cleanLine(query) && !hasExactDiagnosisOption;
  const hasExactGoalOption = goals.some((goal) => searchKey(goal) === searchKey(goalQuery));
  const showAddGoalOption = state.activeGoalSuggest === `goal:${index}` && cleanLine(goalQuery) && !hasExactGoalOption;
  const selectedNandas = new Set(selectedNandasForRow(row));
  const customSelected = cleanLine(row.diagnosis) && !row.diagnosisIds?.length && searchKey(row.diagnosis) === searchKey(query);
  return `
    <div class="diagnosis-item">
      <div class="diagnosis-row-main">
        <div class="field diagnosis-search-field diagnosis-picker-field">
          <label>Chẩn đoán điều dưỡng</label>
          <div class="diagnosis-combobox">
            <input type="search" list="care-nanda-diagnosis-options" value="${h(query)}" placeholder="Nhập keyword nhận định..." data-dx-query="${index}" ${inputNextAttrs("search")} />
            <button type="button" class="diagnosis-dropdown-toggle" data-action="toggle-dx-dropdown" data-index="${index}" aria-label="Hiển thị danh sách nhận định">▼</button>
          </div>
          ${state.activeDiagnosisSuggest === index && (diagnosisLoading || diagnosisOptions.length || showAddDiagnosisOption) ? `
            <div class="suggestion-list diagnosis-dropdown-list" data-dx-list="${index}">
              ${diagnosisLoading ? renderDiagnosisCatalogStatus() : ""}
              ${diagnosisOptions.slice(0, 10).map((item) => `
                <label class="diagnosis-dropdown-option">
                  <input type="checkbox" ${selectedNandas.has(item.nanda) ? "checked" : ""} data-dx-catalog-check="${index}" data-nanda="${h(item.nanda)}" />
                  <span>
                    ${renderSuggestionLines(item.nanda, "strong")}
                    <em>${h(item.ids.length)} gợi ý</em>
                  </span>
                </label>
              `).join("")}
              ${showAddDiagnosisOption ? `
                <label class="diagnosis-dropdown-option suggestion-add-new">
                  <input type="checkbox" ${customSelected ? "checked" : ""} data-dx-custom-check="${index}" data-value="${h(query)}" />
                  <span>
                    <strong>Thêm mới nhận định</strong>
                    <em>${h(query)}</em>
                  </span>
                </label>
              ` : ""}
            </div>
          ` : ""}
        </div>
        <button class="remove-row-btn" data-action="remove-diagnosis" data-index="${index}" aria-label="Xóa chẩn đoán">Xóa</button>
      </div>
      ${`
        <div class="field diagnosis-search-field diagnosis-nested-dropdown">
          <label>Liên quan tới</label>
          <div class="diagnosis-combobox">
            <input type="search" list="care-nanda-cause-options" value="${h(causeInputValue)}" placeholder="Nhập keyword nguyên nhân..." data-dx-cause-query="${index}" ${inputNextAttrs("search")} />
            <button type="button" class="diagnosis-dropdown-toggle" data-action="toggle-dx-cause-dropdown" data-index="${index}" aria-label="Hiển thị danh sách nguyên nhân">▼</button>
          </div>
          ${state.activeCauseSuggest === index ? `
            <div class="suggestion-list diagnosis-dropdown-list" data-cause-list="${index}">
              ${causeOptions.length ? causeOptions.map((item) => `
                <label class="diagnosis-dropdown-option">
                  <input type="checkbox" value="${h(item.cause)}" ${row.causes?.includes(item.cause) ? "checked" : ""} data-dx-cause="${index}" />
                  <span>
                    ${renderSuggestionLines(item.cause, "strong")}
                    <em>${h(item.ids.length)} gợi ý</em>
                  </span>
                </label>
              `).join("") : `<div class="diagnosis-dropdown-empty">Không có nguyên nhân phù hợp.</div>`}
            </div>
          ` : ""}
        </div>
      `}
      ${`
        <div class="field diagnosis-search-field diagnosis-nested-dropdown">
          <label>Mục tiêu can thiệp gợi ý</label>
          <div class="diagnosis-combobox diagnosis-combobox-with-add">
            <input type="search" list="care-nanda-goal-options" value="${h(goalInputValue)}" placeholder="Nhập keyword mục tiêu..." data-dx-goal-query="${index}" ${inputNextAttrs("search")} />
            <button type="button" class="diagnosis-add-inline-btn" data-action="add-custom-goal" data-index="${index}" aria-label="Thêm mục tiêu">+</button>
            <button type="button" class="diagnosis-dropdown-toggle" data-action="toggle-dx-goal-dropdown" data-index="${index}" aria-label="Hiển thị danh sách mục tiêu">▼</button>
          </div>
          ${state.activeGoalSuggest === `goal:${index}` ? `
            <div class="suggestion-list diagnosis-dropdown-list" data-goal-list="${index}">
              ${goalOptions.length ? goalOptions.map((goal) => `
                <label class="diagnosis-dropdown-option">
                  <input type="checkbox" value="${h(goal)}" ${selectedGoals.has(goal) ? "checked" : ""} data-dx-goal="${index}" />
                  <span>
                    ${renderSuggestionLines(goal, "strong")}
                  </span>
                </label>
              `).join("") : `<div class="diagnosis-dropdown-empty">Không có mục tiêu phù hợp.</div>`}
              ${showAddGoalOption ? `
                <label class="diagnosis-dropdown-option suggestion-add-new">
                  <input type="checkbox" data-dx-custom-goal-check="${index}" data-value="${h(goalQuery)}" />
                  <span>
                    <strong>Thêm mục tiêu mới</strong>
                    <em>${h(goalQuery)}</em>
                  </span>
                </label>
              ` : ""}
            </div>
          ` : ""}
        </div>
      `}
    </div>
  `;
}

function renderDiagnosisPickerModal() {
  const rowIndex = state.diagnosisPicker.rowIndex;
  const row = state.diagnosisRows[rowIndex] || createDiagnosisRow();
  const selectedIds = new Set((row.diagnosisIds || []).map(String));
  const options = nandaCatalogOptions(state.diagnosisPicker.query || row.diagnosisQuery || "");
  const pickerLoading = state.diagnosisCatalogLoading;
  return `
    <div class="scale-modal-overlay" data-action="close-diagnosis-picker-overlay">
      <div class="scale-modal diagnosis-picker-modal">
        <div class="scale-modal-header">
          <h2>Chọn chẩn đoán phù hợp</h2>
          <button class="scale-modal-close" data-action="close-diagnosis-picker">&times;</button>
        </div>
        <div class="scale-modal-body">
          <label class="assessment-field">
            <span>Tìm kiếm</span>
            <input type="search" value="${h(state.diagnosisPicker.query || "")}" data-dx-picker-query="${rowIndex}" placeholder="Tìm kiếm..." ${inputNextAttrs("search")} />
          </label>
          <div class="diagnosis-picker-list">
            ${pickerLoading ? renderDiagnosisCatalogStatus() : ""}
            ${options.map((item) => {
              const firstId = String(item.ids[0]);
              const checked = item.ids.some((id) => selectedIds.has(String(id)));
              return `
                <label class="diagnosis-picker-option">
                  <span>${h(item.nanda)} <em>(${h(firstId)})</em></span>
                  <input type="checkbox" value="${h(firstId)}" ${checked ? "checked" : ""} data-dx-picker-option="${rowIndex}" data-nanda="${h(item.nanda)}" />
                </label>
              `;
            }).join("")}
          </div>
        </div>
        <div class="scale-modal-footer">
          <div class="scale-modal-result"></div>
          <div class="scale-modal-actions">
            <button class="btn ghost" data-action="close-diagnosis-picker">Hủy</button>
            <button class="btn primary" data-action="confirm-diagnosis-picker">Xác nhận</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderInterventionPanel() {
  const draft = state.interventionDraft || createInterventionDraft();
  const codeOptions = state.activeInterventionSuggest === "draft-code"
    ? interventionDropdownOptions(draft.codeQuery, "code")
    : [];
  const contentOptions = state.activeInterventionSuggest === "draft-content"
    ? interventionDropdownOptions(draft.contentQuery, "content")
    : [];
  const codeLoading = state.activeInterventionSuggest === "draft-code" && state.diagnosisCatalogLoading;
  const contentLoading = state.activeInterventionSuggest === "draft-content" && state.diagnosisCatalogLoading;
  return `
    <section class="panel">
      <div class="panel-header">
        <div>
          <h2 class="panel-title">Can thiệp chăm sóc</h2>
          <p class="panel-subtitle">Gợi ý theo chẩn đoán, mục tiêu và nhận định; chọn mã sẽ tự lấy nội dung, chọn nội dung sẽ tự lấy mã.</p>
        </div>
        <span class="step-badge">4</span>
      </div>
      <div class="panel-body">
        <div class="intervention-item">
          <div class="intervention-row-fields">
            <div class="field intervention-search-field intervention-code-field">
              <label>Mã can thiệp</label>
              <div class="diagnosis-combobox">
                <input list="care-nanda-intervention-code-options" value="${h(draft.codeQuery)}" placeholder="Nhập mã..." data-iv-code-query="draft" ${inputNextAttrs()} />
                <button type="button" class="diagnosis-dropdown-toggle" data-action="toggle-iv-code-dropdown" aria-label="Hiển thị danh sách mã can thiệp">▼</button>
              </div>
              ${codeLoading || codeOptions.length ? `
                <div class="suggestion-list diagnosis-dropdown-list" data-iv-list="code">
                  ${codeLoading ? renderDiagnosisCatalogStatus() : ""}
                  ${codeOptions.map((item) => `
                    <label class="diagnosis-dropdown-option">
                      <input type="checkbox" ${isInterventionDraftSelected(item) ? "checked" : ""} data-iv-option-check="code" data-code="${h(item.code)}" data-content="${h(item.name)}" />
                      <span>
                        <strong>${h(item.code)}</strong>
                        ${renderSuggestionLines(item.name)}
                      </span>
                    </label>
                  `).join("")}
                </div>
              ` : ""}
            </div>
            <div class="field intervention-search-field">
              <label>Nội dung can thiệp</label>
              <div class="diagnosis-combobox">
                <input list="care-nanda-intervention-content-options" value="${h(draft.contentQuery)}" placeholder="Nhập nội dung..." data-iv-content-query="draft" ${inputNextAttrs()} />
                <button type="button" class="diagnosis-dropdown-toggle" data-action="toggle-iv-content-dropdown" aria-label="Hiển thị danh sách nội dung can thiệp">▼</button>
              </div>
              ${contentLoading || contentOptions.length ? `
                <div class="suggestion-list diagnosis-dropdown-list" data-iv-list="content">
                  ${contentLoading ? renderDiagnosisCatalogStatus() : ""}
                  ${contentOptions.map((item) => `
                    <label class="diagnosis-dropdown-option">
                      <input type="checkbox" ${isInterventionDraftSelected(item) ? "checked" : ""} data-iv-option-check="content" data-code="${h(item.code)}" data-content="${h(item.name)}" />
                      <span>
                        ${renderSuggestionLines(item.name, "strong")}
                        <em>${h(item.code)}</em>
                      </span>
                    </label>
                  `).join("")}
                </div>
              ` : ""}
            </div>
          </div>
          ${draft.selected?.length ? `
            <div class="selected-intervention-draft">
              ${draft.selected.map((item, index) => `
                <span>${h(item.code)} - ${h(item.content)} <button type="button" data-action="remove-draft-intervention" data-index="${index}">×</button></span>
              `).join("")}
            </div>
          ` : ""}
          <button class="btn primary" style="margin-top: 12px;" data-action="save-interventions">Lưu</button>
        </div>
        ${state.interventionRows.length ? `
          <div class="saved-intervention-list">
            <strong>Can thiệp đã lưu</strong>
          <div class="intervention-grid">
            ${state.interventionRows
              .map(
                (row, index) => {
                  return `
                <div class="intervention-item saved-intervention-card">
                  <div class="saved-intervention-content"><b>${h(row.code)}</b> - ${h(row.content)}</div>
                  <button class="remove-row-btn icon-remove-btn" data-action="remove-intervention" data-index="${index}" aria-label="Xóa can thiệp">×</button>
                </div>
              `;
                },
              )
              .join("")}
          </div>
          </div>
        ` : ""}
      </div>
    </section>
  `;
}

function renderHealthEducationPanel() {
  const stages = [
    { key: "admission", label: "Bắt đầu nhập viện" },
    { key: "treatment", label: "Trong khi điều trị" },
    { key: "discharge", label: "Trước khi ra viện" },
    { key: "summary", label: "Tổng hợp" },
  ];
  const forms = ensureHealthEducationForms();
  return `
    <section class="panel health-education-panel">
      <div class="panel-header">
        <div>
          <h2 class="panel-title">Tư vấn, giáo dục sức khỏe</h2>
          <p class="panel-subtitle">Ghi nhận nội dung tư vấn theo từng giai đoạn chăm sóc.</p>
        </div>
        <span class="step-badge">5</span>
      </div>
      <div class="panel-body">
        <div class="health-education-buttons">
          ${stages.map((stage) => `
            <button type="button" class="health-education-stage-btn" data-health-education-stage="${h(stage.key)}">
              <strong>${h(stage.label)}</strong>
              <span>${h(healthEducationStageStatus(stage.key, forms[stage.key]))}</span>
            </button>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}

function healthEducationStageStatus(stageKey, form) {
  if (stageKey === "summary") return cleanLine(form?.note) ? "Đã có ghi chú" : "Xem tổng hợp";
  const items = Array.isArray(form?.items) ? form.items : [];
  const doneCount = items.filter((item) => cleanLine(item.need) || cleanLine(item.result) || cleanLine(item.content)).length;
  return doneCount ? `${doneCount}/${items.length} nội dung` : "Chưa nhập";
}

function renderHealthEducationModal() {
  const stageKey = state.activeHealthEducationStage;
  if (!stageKey) return "";
  const stages = {
    admission: "Bắt đầu nhập viện",
    treatment: "Trong khi điều trị",
    discharge: "Trước khi ra viện",
    summary: "Tổng hợp",
  };
  const forms = ensureHealthEducationForms();
  return `
    <div class="scale-modal-overlay" data-action="close-health-education-overlay">
      <div class="scale-modal gdsk-modal">
        <div class="scale-modal-header gdsk-modal-header">
          <div>
            <h2>Tư vấn, giáo dục sức khỏe</h2>
            <p>${h(stages[stageKey] || stageKey)}</p>
          </div>
          <button class="scale-modal-close" data-action="close-health-education">&times;</button>
        </div>
        <div class="scale-modal-body">
          ${renderHealthEducationForm(stageKey, forms[stageKey])}
        </div>
        <div class="scale-modal-footer">
          <div class="scale-modal-result"></div>
          <div class="scale-modal-actions">
            <button class="btn primary" data-action="close-health-education">Xong</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function ensureHealthEducationForms(check = state.assessmentChecklist) {
  const defaults = createDefaultHealthEducationForms();
  const forms = check.healthEducationForms && typeof check.healthEducationForms === "object"
    ? check.healthEducationForms
    : {};
  check.healthEducationForms = {
    admission: normalizeHealthEducationStage(defaults.admission, forms.admission),
    treatment: normalizeHealthEducationStage(defaults.treatment, forms.treatment),
    discharge: normalizeHealthEducationStage(defaults.discharge, forms.discharge),
    summary: { ...defaults.summary, ...(forms.summary || {}) },
  };
  return check.healthEducationForms;
}

function normalizeHealthEducationStage(defaultStage, savedStage = {}) {
  const savedItems = Array.isArray(savedStage?.items) ? savedStage.items : [];
  return {
    ...defaultStage,
    ...savedStage,
    items: defaultStage.items.map((defaultItem, index) => {
      const savedItem = savedItems.find((item) => item?.id === defaultItem.id) || savedItems[index] || {};
      return {
        ...defaultItem,
        need: savedItem.need || "",
        result: savedItem.result || "",
      };
    }),
  };
}

function renderHealthEducationForm(stageKey, form) {
  if (stageKey === "summary") {
    return `
      <div class="gdsk-form">
        ${renderHealthEducationSummaryForm()}
      </div>
    `;
  }
  return `
    <div class="gdsk-form">
      <div class="gdsk-table">
        <div class="gdsk-row gdsk-head">
          <span>TT</span>
          <span>Nội dung hướng dẫn</span>
          <span>Nhu cầu hướng dẫn</span>
          <span>Kết quả hướng dẫn</span>
        </div>
        ${(form.items || []).map((item, index) => `
          <div class="gdsk-row">
            <span>${index + 1}</span>
            <span>${h(item.content || "")}</span>
            <div class="gdsk-inline-options">
              ${gdskRadio(stageKey, index, "need", "Có", item.need)}
              ${gdskRadio(stageKey, index, "need", "Không", item.need)}
            </div>
            <div class="gdsk-inline-options">
              ${gdskRadio(stageKey, index, "result", "HDTh", item.result)}
              ${gdskRadio(stageKey, index, "result", "HTHD", item.result)}
            </div>
          </div>
        `).join("")}
      </div>
      <div class="gdsk-meta-grid">
        ${gdskMetaField(stageKey, "date", "Ngày tư vấn", form.date || currentVietnamDateInput(), "date")}
        ${gdskMetaField(stageKey, "staffName", "Người tư vấn", form.staffName || "")}
        ${gdskMetaField(stageKey, "patientSign", "Người bệnh/người nhà ký nhận", form.patientSign || "")}
      </div>
      ${gdskNoteField(stageKey, "Ghi chú", form.note || "")}
    </div>
  `;
}

function renderHealthEducationSummaryForm() {
  const forms = ensureHealthEducationForms();
  return renderGdskDetailDocument(forms);
}

function renderGdskDetailDocument(forms, context = {}) {
  const patient = context.patient || state.patient || {};
  const sheet = context.sheet || {};
  return `
    <div class="gdsk-detail-preview">
      <div class="gdsk-detail-document">
        <div class="gdsk-detail-top">
          <div>
            <strong>BỆNH VIỆN QUÂN Y 103</strong>
            <span>Khoa: ${h(patient.department || "................................")}</span>
          </div>
          <div>
            <strong>MS: CSNB-05</strong>
            <span>Số vào viện: ${h(sheet.ma_phieu || patient.code || "................")}</span>
          </div>
        </div>
        <h3>PHIẾU TƯ VẤN - HƯỚNG DẪN - GIÁO DỤC SỨC KHỎE</h3>
        <div class="gdsk-detail-patient">
          <span>Họ và tên người bệnh: <strong>${h(patient.name || "................................")}</strong></span>
          <span>Tuổi: <strong>${h(patient.age || "....")}</strong></span>
          <span>Phòng: <strong>${h(patient.room || "....")}</strong></span>
          <span>Giường: <strong>${h(patient.bed || "....")}</strong></span>
        </div>
        ${renderGdskDetailSection("I", "Tư vấn, hướng dẫn khi bắt đầu nhập viện", forms.admission)}
        ${renderGdskDetailSection("II", "Tư vấn, hướng dẫn trong khi điều trị", forms.treatment)}
        ${renderGdskDetailSection("III", "Tư vấn, hướng dẫn trước khi ra viện", forms.discharge)}
        ${cleanLine(forms.summary?.note) ? `<div class="gdsk-detail-note"><strong>Ghi chú tổng hợp:</strong> ${h(forms.summary.note)}</div>` : ""}
      </div>
    </div>
  `;
}

function renderGdskDetailSection(prefix, title, form = {}) {
  const items = Array.isArray(form.items) ? form.items : [];
  return `
    <section class="gdsk-detail-section">
      <h4>${h(prefix)}. ${h(title)}</h4>
      <table class="gdsk-detail-table">
        <thead>
          <tr>
            <th rowspan="2">TT</th>
            <th rowspan="2">Nội dung</th>
            <th colspan="2">Nhu cầu hướng dẫn</th>
            <th colspan="2">Kết quả hướng dẫn</th>
          </tr>
          <tr>
            <th>Có</th>
            <th>Không</th>
            <th>HDTh</th>
            <th>HTHD</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${h(item.content || "")}</td>
              ${gdskMarkCell(isGdskNeedYes(item.need))}
              ${gdskMarkCell(isGdskNeedNo(item.need))}
              ${gdskMarkCell(item.result === "HDTh")}
              ${gdskMarkCell(item.result === "HTHD")}
            </tr>
          `).join("")}
        </tbody>
      </table>
      <div class="gdsk-detail-date">Thời điểm tư vấn: <strong>${h(formatGdskDate(form.date))}</strong></div>
      ${cleanLine(form.note) ? `<div class="gdsk-detail-note"><strong>Ghi chú:</strong> ${h(form.note)}</div>` : ""}
      <div class="gdsk-detail-signatures">
        <div>
          <strong>Người thực hiện</strong>
          <span>(Ký, ghi rõ họ tên)</span>
          <em>${h(form.staffName || "................................")}</em>
        </div>
        <div>
          <strong>Chữ ký người bệnh/thân nhân</strong>
          <span>(Ký, ghi rõ họ tên)</span>
          <em>${h(form.patientSign || "................................")}</em>
        </div>
      </div>
    </section>
  `;
}

function gdskMarkCell(checked) {
  return `<td class="gdsk-mark-cell" data-checked="${checked ? "true" : "false"}">${checked ? `<span class="gdsk-checkmark">x</span>` : ""}</td>`;
}

function formatGdskDate(value) {
  if (!value) return "........./........./20.........";
  return formatVietnamDate(value);
}

function isGdskNeedNo(value) {
  return String(value || "").toLowerCase().includes("kh");
}

function isGdskNeedYes(value) {
  return Boolean(value) && !isGdskNeedNo(value);
}

function renderHealthEducationSummaryTableLegacy() {
  const forms = ensureHealthEducationForms();
  const rows = ["admission", "treatment", "discharge"].flatMap((stage) =>
    (forms[stage].items || [])
      .filter((item) => cleanLine(item.content) || cleanLine(item.need) || cleanLine(item.result))
      .map((item) => ({ stage, ...item })),
  );
  const labels = { admission: "Bắt đầu nhập viện", treatment: "Trong khi điều trị", discharge: "Trước khi ra viện" };
  if (!rows.length) return `<div class="empty">Chưa có nội dung tư vấn, giáo dục sức khỏe.</div>`;
  return `
    <div class="gdsk-table gdsk-summary-table">
      <div class="gdsk-row gdsk-head">
        <span>Ngày/Giai đoạn</span>
        <span>Nội dung</span>
        <span>Nhu cầu</span>
        <span>Kết quả</span>
      </div>
      ${rows.map((row) => `
        <div class="gdsk-row">
          <span>${h(labels[row.stage])}</span>
          <span>${h(row.content || "-")}</span>
          <span>${h(row.need || "-")}</span>
          <span>${h(row.result || "-")}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function gdskRadio(stageKey, index, field, value, selected) {
  return `
    <label>
      <input type="radio" name="gdsk_${h(stageKey)}_${index}_${field}" value="${h(value)}" ${selected === value ? "checked" : ""} data-gdsk-radio="${h(stageKey)}:${index}:${field}" />
      <span>${h(value)}</span>
    </label>
  `;
}

function gdskNoteField(stageKey, label, value) {
  return `
    <label class="assessment-field assessment-full gdsk-note-field">
      <span>${h(label)}</span>
      <textarea data-gdsk-note="${h(stageKey)}" enterkeyhint="next" autocomplete="off" autocapitalize="sentences">${h(value)}</textarea>
    </label>
  `;
}

function gdskMetaField(stageKey, field, label, value, type = "text") {
  return `
    <label class="assessment-field">
      <span>${h(label)}</span>
      <input type="${type}" value="${h(value)}" data-gdsk-meta="${h(stageKey)}:${h(field)}" ${inputNextAttrs(type)} />
    </label>
  `;
}

function renderHandoverMedicineTable() {
  const rows = handoverMedicineRows(state.assessmentChecklist);
  return `
    <div class="handover-medicine">
      <div class="handover-medicine-header">
        <strong>Nội dung bàn giao thuốc</strong>
      </div>
      ${rows.length ? `
        <div class="handover-medicine-table">
          <table class="handover-medicine-data">
            <thead>
              <tr><th>Tên thuốc/Hàm lượng</th><th>Liều dùng</th><th>Đường dùng</th><th>Thời gian</th><th>Y lệnh</th><th></th></tr>
            </thead>
            <tbody>
              ${rows.map((row, index) => `
                <tr>
                  <td data-label="Tên thuốc/Hàm lượng">${h([row.name, row.strength].filter(Boolean).join(" / ") || "-")}</td>
                  <td data-label="Liều dùng">${h(row.dose || "-")}</td>
                  <td data-label="Đường dùng">${h(row.route || "-")}</td>
                  <td data-label="Thời gian">${h(row.time || "-")}</td>
                  <td data-label="Y lệnh">${h(row.order || "-")}</td>
                  <td class="handover-medicine-action"><button type="button" class="remove-row-btn" data-action="remove-handover-medicine" data-index="${index}">Xóa</button></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      ` : `<div class="handover-medicine-empty">Chưa có thuốc bàn giao.</div>`}
      <div class="handover-medicine-footer">
        <button type="button" class="btn primary" data-action="add-handover-medicine">Thêm thuốc bàn giao</button>
      </div>
    </div>
  `;
}

function renderHandoverMedicineModal() {
  const draft = normalizeHandoverMedicineRow(state.handoverMedicineDraft);
  return `
    <div class="scale-modal-overlay" data-action="close-handover-medicine-overlay">
      <div class="scale-modal handover-medicine-modal" role="dialog" aria-modal="true" aria-labelledby="handover-medicine-modal-title">
        <div class="scale-modal-header">
          <h2 id="handover-medicine-modal-title">Thêm thuốc bàn giao</h2>
          <button type="button" class="scale-modal-close" data-action="close-handover-medicine">&times;</button>
        </div>
        <div class="scale-modal-body">
          <div class="handover-medicine-form">
            ${handoverMedicineDraftField("name", "Tên thuốc", draft.name)}
            ${handoverMedicineDraftField("strength", "Hàm lượng", draft.strength)}
            ${handoverMedicineDraftField("dose", "Liều dùng", draft.dose)}
            ${handoverMedicineDraftField("route", "Đường dùng", draft.route)}
            ${handoverMedicineDraftField("time", "Thời gian", draft.time, "datetime-local")}
            ${handoverMedicineDraftField("order", "Y lệnh", draft.order)}
          </div>
        </div>
        <div class="scale-modal-footer handover-medicine-modal-footer">
          <div class="scale-modal-actions">
            <button type="button" class="btn ghost" data-action="close-handover-medicine">Hủy</button>
            <button type="button" class="btn primary" data-action="save-handover-medicine">Lưu</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function handoverMedicineDraftField(key, label, value, type = "text") {
  return `
    <label class="assessment-field">
      <span>${h(label)}</span>
      <input type="${type}" value="${h(value || "")}" data-handover-medicine-draft="${h(key)}" ${inputNextAttrs(type)} />
    </label>
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
          ${checkBool("handoverMedicineHalf", "Thuốc", check.handoverMedicineHalf)}
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
        ${check.handoverMedicineHalf ? renderHandoverMedicineTable() : ""}
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
  const rows = (state.diagnosisSavedRows || []).length ? state.diagnosisSavedRows : state.diagnosisRows;
  return rows
    .map((row) => ({
      code: diagnosisCodeSummary(row),
      diagnosis: cleanLine(row.diagnosis),
      causes: (Array.isArray(row.causes) ? row.causes : []).map(cleanLine).filter(Boolean),
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
    handoverMedicines: check.handoverMedicineHalf ? handoverMedicineRows(check) : [],
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

function hasAnyFilledValue(values) {
  return values.some((value) => {
    if (Array.isArray(value)) return value.some((item) => cleanLine(item));
    if (typeof value === "boolean") return value;
    return Boolean(cleanLine(value));
  });
}

function hasAssessmentTabContent() {
  const check = state.assessmentChecklist;
  const assessmentFields = [
    "pulse",
    "temperature",
    "bloodPressure",
    "spo2",
    "bodyType",
    "consciousness",
    "mucosa",
    "edema",
    "systemicNote",
    "breathingMode",
    "ventilationAirway",
    "oxygenFlow",
    "ventilatorMode",
    "fio2",
    "peep",
    "vt",
    "respiratoryRate",
    "coughStatus",
    "respiratoryNote",
    "circulationSymptoms",
    "peripheralPerfusion",
    "heartRhythm",
    "heartRateStatus",
    "heartSounds",
    "circulationOtherChecked",
    "circulationOther",
    "neuroConsciousness",
    "neuroConsciousnessOther",
    "neuroOrientation",
    "neuroOrientationOther",
    "neuroBehaviorStatus",
    "neuroBehavior",
    "neuroBehaviorOther",
    "neuroFocalSignsStatus",
    "neuroFocalSigns",
    "neuroFocalSignsOther",
    "abdomen",
    "painLocation",
    "painLocationOther",
    "painCharacter",
    "painCharacterOther",
    "nauseaVomiting",
    "nauseaVomitingOther",
    "flatus",
    "flatusOther",
    "stool",
    "stoolOther",
    "urinary",
    "urineAmount",
    "nutritionRoute",
    "nutritionRegimen",
    "nutritionRegimenOther",
    "pathologicalDiet",
    "pathologicalDietTypes",
    "pathologicalDietOther",
    "mobilityAbility",
    "mobilityAbilityOther",
    "muscleStrength",
    "muscleStrengthOther",
    "movementStatus",
    "movementStatusOther",
    "diseasedOrgan",
    "fallRiskAssessment",
    "vteRiskAssessment",
    "painAssessment",
    "pressureUlcerRiskAssessment",
    "glasgowAssessment",
    "obgynEnabled",
  ];
  if (state.careLevel === "1") {
    assessmentFields.push("fluidIn", "fluidOut", "fluidBalance");
  }
  const hasStructuredContent = hasAnyFilledValue(assessmentFields.map((field) => check[field]));
  const hasSuggestedContent = [...state.selectedAssessments].some((id) =>
    id.startsWith("custom-assessment-") ? cleanLine(state.assessmentEdits[id]) : true,
  );
  return hasStructuredContent || hasSuggestedContent;
}

function hasHealthEducationTabContent() {
  const forms = ensureHealthEducationForms();
  return ["admission", "treatment", "discharge"].some((stageKey) => {
    const form = forms[stageKey] || {};
    const hasItemContent = (form.items || []).some((item) => cleanLine(item.need) || cleanLine(item.result));
    return hasItemContent || hasAnyFilledValue([form.staffName, form.patientSign, form.note]);
  }) || hasAnyFilledValue([forms.summary?.note]);
}

function missingCareFormTabs() {
  const missing = [];
  const handover = handoverPayload();
  if (!hasAssessmentTabContent()) missing.push({ id: "assessment", label: "Nhận định" });
  if (!selectedCareDiagnoses().length) missing.push({ id: "diagnosis", label: "Chẩn đoán" });
  if (!selectedCareInterventions().length) missing.push({ id: "intervention", label: "Can thiệp" });
  if (!hasAnyFilledValue(Object.values(handover))) missing.push({ id: "handover", label: "Bàn giao" });
  if (!hasHealthEducationTabContent()) missing.push({ id: "education", label: "TVHD GDSK" });
  return missing;
}

async function saveCareSheetToSupabase() {
  const client = getSupabaseClient();
  const selected = patients[state.selectedPatientIndex] || patients[0];
  const patientInfo = currentCarePatientInfo();
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
    ma_benh_nhan: patientInfo.code || selected.code,
    ho_ten: patientInfo.name || selected.name,
    tuoi: patientInfo.age || selected.age,
    gioi_tinh: patientInfo.sex || selected.sex,
    phong: patientInfo.room || selected.room,
    giuong: patientInfo.bed || null,
    khoa: patientInfo.department || department.ten_khoa,
    chan_doan_y_khoa: patientInfo.diagnosis || condition.ten_mat_benh,
  };

  const { data: existingPatient, error: findPatientError } = await client
    .from("dsbn")
    .select("id")
    .eq("ma_benh_nhan", patientPayload.ma_benh_nhan)
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
    state.careSheetsPatient = null;
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
      .select("id, ma_benh_nhan, ho_ten, tuoi, gioi_tinh, phong, giuong, khoa")
      .eq("ma_benh_nhan", selected.code)
      .maybeSingle();
    if (patientError) throw patientError;

    if (!patient) {
      state.careSheets = [];
      state.careSheetsPatient = null;
      return;
    }
    state.careSheetsPatient = patient;

    const { data, error } = await client
      .from("danh_sach_phieu_cs")
      .select("id, ma_phieu, cap_cham_soc, thoi_gian_danh_gia, nguoi_danh_gia, nhan_dinh_json, chan_doan_muc_tieu_json, can_thiep_json, ban_giao_json, thang_diem_json, created_at")
      .eq("benh_nhan_id", patient.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    state.careSheets = data || [];
  } catch (error) {
    state.careSheets = [];
    state.careSheetsPatient = null;
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
    allergy: "Dị ứng",
    allergy_note: "Thông tin dị ứng",
    allergyDrug: "Dị ứng thuốc",
    allergyFood: "Dị ứng thức ăn",
    allergyOther: "Dị ứng khác",
    allergySymptoms: "Biểu hiện dị ứng",
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
    coughStatus: "Ho",
    spo2: "SpO2",
    vasopressorOther: "Vận mạch khác",
    abdomen: "Bụng",
    painLocation: "Vị trí đau",
    painLocationOther: "Vị trí đau khác",
    painCharacter: "Tính chất đau",
    painCharacterOther: "Tính chất đau khác",
    nauseaVomiting: "Nôn/Buồn nôn",
    nauseaVomitingOther: "Nôn/Buồn nôn khác",
    flatus: "Trung tiện",
    flatusOther: "Trung tiện khác",
    stool: "Đại tiện",
    stoolOther: "Đại tiện khác",
    urinary: "Tiểu tiện",
    urineAmount: "Số lượng nước tiểu",
    nutritionType: "Dinh dưỡng",
    menu: "Thực đơn",
    nutritionRoute: "Đường nuôi dưỡng",
    nutritionRegimen: "Chế độ dinh dưỡng",
    nutritionRegimenOther: "Chế độ dinh dưỡng khác",
    pathologicalDietTypes: "Loại chế độ bệnh lý",
    pathologicalDietOther: "Chế độ bệnh lý khác",
    mobilityAbility: "Khả năng vận động",
    mobilityAbilityOther: "Khả năng vận động khác",
    muscleStrength: "Tình trạng cơ lực",
    muscleStrengthOther: "Tình trạng cơ lực khác",
    movementStatus: "Tình trạng vận động",
    movementStatusOther: "Tình trạng vận động khác",
    treatmentEducation: "Hướng dẫn điều trị",
    careEducation: "Hướng dẫn chăm sóc",
    preventionEducation: "Giáo dục phòng bệnh",
    circulationNote: "Khác",
    circulationSymptoms: "Triệu chứng cơ năng",
    peripheralPerfusion: "Tưới máu ngoại vi",
    heartRhythm: "Nhịp tim",
    heartRateStatus: "Mạch",
    heartSounds: "Tiếng tim",
    circulationOther: "Tuần hoàn khác",
    respiratoryNote: "Khác",
    neuroConsciousness: "Ý thức",
    neuroConsciousnessOther: "Ý thức khác",
    neuroOrientation: "Định hướng",
    neuroOrientationOther: "Định hướng khác",
    neuroBehaviorStatus: "Tri giác - hành vi",
    neuroBehavior: "Tri giác - hành vi",
    neuroBehaviorOther: "Tri giác - hành vi khác",
    neuroFocalSignsStatus: "Dấu hiệu thần kinh khu trú",
    neuroFocalSigns: "Dấu hiệu thần kinh khu trú",
    neuroFocalSignsOther: "Dấu hiệu thần kinh khu trú khác",
    diseasedOrgan: "Cơ quan bệnh",
    handoverOther: "Bàn giao khác",
  };
  const booleanLabels = {
    handoverMedicineHalf: "Bàn giao: Thuốc",
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
    circulationOtherChecked: "Tuần hoàn: Khác",
    pathologicalDiet: "Chế độ bệnh lý",
    fallRiskAssessment: "Thang điểm đánh giá: Nguy cơ té ngã",
    vteRiskAssessment: "Thang điểm đánh giá: Nguy cơ viêm tĩnh mạch",
    painAssessment: "Thang điểm đánh giá: Đau",
    pressureUlcerRiskAssessment: "Thang điểm đánh giá: Nguy cơ loét tỳ đè",
    glasgowAssessment: "Thang điểm đánh giá: Glasgow",
  };
  return Object.entries(state.assessmentChecklist)
    .filter(([key, value]) =>
      !key.startsWith("obgyn") &&
      key !== "handoverMedicines" &&
      (typeof value === "boolean" ? value : Array.isArray(value) ? value.length : cleanLine(value)),
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
    "A. Thông tin người bệnh": ["evalTime", "evaluator", "height", "weight", "bmi", "allergy", "allergyDrug", "allergyFood", "allergyOther", "allergySymptoms", "allergy_note"],
    ...(state.careLevel === "1" ? { "B. Theo dõi dịch": ["fluidIn", "fluidOut", "fluidBalance"] } : {}),
    "C. Dấu hiệu sinh tồn": ["pulse", "temperature", "bloodPressure", "spo2"],
    "D. Toàn thân": ["bodyType", "consciousness", "mucosa", "edema", "systemicNote"],
    "E. Hô hấp": ["breathingMode", "respiratoryRate", "respiratoryNote", "oxygenFlow", "ventilationAirway", "ventilatorMode", "fio2", "peep", "vt", "coughStatus"],
    "F. Tuần hoàn": ["circulationSymptoms", "peripheralPerfusion", "heartRhythm", "heartRateStatus", "heartSounds", "circulationOther"],
    "G. Thần kinh cảm giác": ["neuroConsciousness", "neuroConsciousnessOther", "neuroOrientation", "neuroOrientationOther", "neuroBehaviorStatus", "neuroBehavior", "neuroBehaviorOther", "neuroFocalSigns", "neuroFocalSignsOther"],
    "H. Tiêu hóa": ["abdomen", "painLocation", "painLocationOther", "painCharacter", "painCharacterOther", "nauseaVomiting", "nauseaVomitingOther", "flatus", "flatusOther", "stool", "stoolOther"],
    "I. Bài tiết": ["urinary", "urineAmount"],
    "J. Dinh dưỡng": ["nutritionRoute", "nutritionRegimen", "nutritionRegimenOther", "pathologicalDiet", "pathologicalDietTypes", "pathologicalDietOther"],
    "K. Vận động/Phục hồi chức năng": ["mobilityAbility", "mobilityAbilityOther", "muscleStrength", "muscleStrengthOther", "movementStatus", "movementStatusOther"],
    "L. Tư vấn, giáo dục sức khỏe": ["treatmentEducation", "careEducation", "preventionEducation"],
    "M. Cơ quan bị bệnh": ["diseasedOrgan"],
    "N. Thang điểm đánh giá": ["fallRiskAssessment", "vteRiskAssessment", "painAssessment", "pressureUlcerRiskAssessment", "glasgowAssessment"],
    "O. Sản phụ khoa": [],
    "P. Bàn giao": ["handoverMedicineHalf", "handoverLab", "handoverWaitLab", "handoverFilm", "handoverWaitFilm", "handoverDressing", "handoverDrain", "handoverVitals", "handoverUrine", "handoverTube", "handoverOther"]
  };
  
  const labels = {
    evalTime: "Thời gian đánh giá", evaluator: "Người đánh giá", height: "Chiều cao", weight: "Cân nặng", bmi: "BMI", allergy: "Dị ứng", allergyDrug: "Dị ứng thuốc", allergyFood: "Dị ứng thức ăn", allergyOther: "Dị ứng khác", allergySymptoms: "Biểu hiện dị ứng", allergy_note: "Thông tin dị ứng",
    fluidIn: "Dịch vào", fluidOut: "Dịch ra", fluidBalance: "Bilance",
    pulse: "Mạch", temperature: "Nhiệt độ", bloodPressure: "Huyết áp", spo2: "SpO2",
    bodyType: "Thể trạng", consciousness: "Ý thức", mucosa: "Da niêm mạc", edema: "Phù", systemicNote: "Khác",
    breathingMode: "Hô hấp", respiratoryRate: "Nhịp thở", respiratoryNote: "Khác", oxygenFlow: "Lưu lượng oxy", ventilationAirway: "Đường thở", ventilatorMode: "Mode thở máy", fio2: "FiO2", peep: "PEEP", vt: "VT", coughStatus: "Ho",
    circulationStable: "Ổn định", circulationFastPulse: "Mạch nhanh", circulationHypotension: "Hạ huyết áp", circulationShock: "Sốc", circulationVasopressor: "Có vận mạch", vasopressorNoradrenaline: "Noradrenaline", vasopressorAdrenaline: "Adrenaline", vasopressorDobutamine: "Dobutamine", vasopressorVasopressin: "Vasopressin", vasopressorOther: "Khác", circulationNote: "Khác", circulationSymptoms: "Triệu chứng cơ năng", peripheralPerfusion: "Tưới máu ngoại vi", heartRhythm: "Nhịp tim", heartRateStatus: "Mạch", heartSounds: "Tiếng tim", circulationOther: "Khác",
    neuroSensory: "Thần kinh cảm giác", neuroConsciousness: "Ý thức", neuroConsciousnessOther: "Ý thức khác", neuroOrientation: "Định hướng", neuroOrientationOther: "Định hướng khác", neuroBehaviorStatus: "Tri giác - hành vi", neuroBehavior: "Tri giác - hành vi", neuroBehaviorOther: "Tri giác - hành vi khác", neuroFocalSignsStatus: "Dấu hiệu thần kinh khu trú", neuroFocalSigns: "Dấu hiệu thần kinh khu trú", neuroFocalSignsOther: "Dấu hiệu thần kinh khu trú khác",
    abdomen: "Bụng", painLocation: "Vị trí đau", painLocationOther: "Vị trí đau khác", painCharacter: "Tính chất đau", painCharacterOther: "Tính chất đau khác", nauseaVomiting: "Nôn/Buồn nôn", nauseaVomitingOther: "Nôn/Buồn nôn khác", flatus: "Trung tiện", flatusOther: "Trung tiện khác", stool: "Đại tiện", stoolOther: "Đại tiện khác",
    urinary: "Bài tiết nước tiểu", urineAmount: "Số lượng nước tiểu",
    nutritionType: "Loại", menu: "Thực đơn", nutritionRoute: "Đường nuôi dưỡng", nutritionRegimen: "Chế độ dinh dưỡng", nutritionRegimenOther: "Chế độ dinh dưỡng khác", pathologicalDiet: "Chế độ bệnh lý", pathologicalDietTypes: "Loại chế độ bệnh lý", pathologicalDietOther: "Chế độ bệnh lý khác",
    mobilityAbility: "Khả năng vận động", mobilityAbilityOther: "Khả năng vận động khác", muscleStrength: "Tình trạng cơ lực", muscleStrengthOther: "Tình trạng cơ lực khác", movementStatus: "Tình trạng vận động", movementStatusOther: "Tình trạng vận động khác", mobilityRehab: "Vận động/PHCN", treatmentEducation: "Hướng dẫn điều trị", careEducation: "Hướng dẫn chăm sóc", preventionEducation: "Giáo dục phòng bệnh", healthEducation: "Giáo dục sức khỏe",
    handoverMedicineHalf: "Thuốc", handoverLab: "Lấy xét nghiệm", handoverWaitLab: "Chờ xét nghiệm", handoverFilm: "Lấy phim", handoverWaitFilm: "Chờ phim", handoverDressing: "Thay băng", handoverDrain: "Theo dõi dẫn lưu", handoverVitals: "Theo dõi DHST", handoverUrine: "Theo dõi nước tiểu", handoverTube: "Chăm sóc sonde", handoverOther: "Khác",
    diseasedOrgan: "Cơ quan bị bệnh",
    fallRiskAssessment: "Đánh giá nguy cơ té ngã",
    vteRiskAssessment: "Đánh giá nguy cơ viêm tĩnh mạch",
    painAssessment: "Đánh giá đau",
    pressureUlcerRiskAssessment: "Đánh giá nguy cơ loét tỳ đè",
    glasgowAssessment: "Đánh giá Glasgow"
  };
  
  for (const [section, fields] of Object.entries(sectionGroups)) {
    const items = section === "O. Sản phụ khoa" ? buildObgynAssessmentItems() : [];
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

function buildObgynAssessmentItems() {
  const check = state.assessmentChecklist;
  if (!check.obgynEnabled || !check.obgynMode || !state.obgynTemplate) return [];
  const typeLabel = check.obgynMode === "obstetric" ? "Sản khoa" : "Phụ khoa";
  return [
    `Loại: ${typeLabel}`,
    ...selectedObgynSections().flatMap((section) => buildObgynFieldItems(section.fields || [], obgynSectionTitle(section.title))),
  ];
}

function buildObgynFieldItems(fields, prefix = "") {
  return fields.flatMap((fieldDef) => {
    const label = prefix ? `${prefix} - ${fieldDef.label}` : fieldDef.label;
    if (fieldDef.type === "group" || fieldDef.type === "object") {
      return buildObgynFieldItems(fieldDef.fields || [], label);
    }
    const value = state.assessmentChecklist[obgynFieldKey(fieldDef.id)];
    if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) return [];
    return [`${label}: ${Array.isArray(value) ? value.join(", ") : value}`];
  });
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

  if (event.target.dataset.action === "close-fall-risk-picker-overlay") {
    state.activeFallRiskScalePicker = null;
    render();
    return;
  }

  if (event.target.dataset.action === "close-health-education-overlay") {
    state.activeHealthEducationStage = null;
    render();
    return;
  }

  if (event.target.dataset.action === "close-diagnosis-picker-overlay") {
    state.diagnosisPicker = null;
    render();
    return;
  }

  if (event.target.dataset.action === "close-handover-medicine-overlay") {
    state.handoverMedicineModalOpen = false;
    state.handoverMedicineDraft = createHandoverMedicineRow();
    render();
    return;
  }

  const target = event.target.closest("button");
  if (!target) return;

  if (target.dataset.patientIndex) {
    state.selectedPatientIndex = Number(target.dataset.patientIndex);
    state.careSheets = [];
    state.careSheetsPatient = null;
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

  if (target.dataset.action === "retry-diagnosis-catalog") {
    const lastSearch = state.diagnosisCatalogLastSearch;
    if (lastSearch?.query) requestDiagnosisCatalogSearch(lastSearch.query, lastSearch.mode);
    render();
    return;
  }

  if (target.dataset.action === "open-sample-evaluation") {
    fetch("./danhgia.json")
      .then((response) => {
        if (!response.ok) throw new Error(`Không mở được danhgia.json (${response.status})`);
        return response.text();
      })
      .then((html) => {
        document.open();
        document.write(html);
        document.close();
      })
      .catch((error) => {
        alert(error.message || error);
      });
    return;
  }

  if (target.dataset.action === "show-experience-guide") {
    alert([
      "Giới thiệu mẫu phiếu chăm sóc điều dưỡng trên bệnh án điện tử",
      "",
      "👉 Đây là mẫu phiếu chăm sóc xây dựng để điều dưỡng có thể ghi chép phiếu chăm sóc trên điện thoại/Máy tính bảng. Mục tiêu hạn chế tối đa phải nhập thông tin, sử dụng tính năng tích chọn để giảm thao tác cũng như thời gian cho việc ghi chép phiếu chăm sóc của điều dưỡng.",
      "",
      "👉 Các anh/chị/em vào trải nghiệm và cho ý kiến đóng góp hoàn thiện form ghi phiếu chăm sóc điều dưỡng để triển khai trên bệnh án điện tử.",
      "",
      "👉 Vui lòng chọn ĐÁNH GIÁ SAU TRẢI NGHIỆM FORM ĐIỆN TỬ để cho ý kiến về mẫu ghi phiếu chăm sóc điều dưỡng.",
      "",
      "👉 Phần chẩn đoán điều dưỡng, mục tiêu can thiệp, can thiệp điều dưỡng được cấu hình logic với nhau.",
      "",
      "✅ Chọn chẩn đoán điều dưỡng 👉 nhập vấn đề/triệu chứng của người bệnh (ví dụ Đau hoặc sốt) 👉 Chọn tiếp liên quan (hệ thống sẽ gợi ý nội dung phù hợp với vấn đề/triệu chứng) 👉 tích chọn nội dung phù hợp.",
      "",
      "Mục tiêu can thiệp: Hệ thống tự gợi ý các nội dung can thiệp phù hợp với chẩn đoán điều dưỡng.",
      "",
      "Can thiệp điều dưỡng: Tương tự hệ thống tự động gợi ý can thiệp điều dưỡng phù hợp với chẩn đoán và mục tiêu.",
    ].join("\n"));
    return;
  }

  if (target.dataset.action === "show-update-info") {
    showUpdateInfo();
    return;
  }

  if (target.dataset.action === "open-nanda-form") {
    state.screen = "nanda";
    loadNandaRows(true);
    render();
    return;
  }

  if (target.dataset.action === "start-full-care-test") {
    startHomeCareTest("patient");
    return;
  }

  if (target.dataset.action === "start-diagnosis-test") {
    startHomeCareTest("diagnosis");
    return;
  }

  if (target.dataset.action === "start-education-test") {
    startHomeCareTest("education");
    return;
  }

  if (target.dataset.action === "start-scale-test") {
    state.screen = "riskScales";
    render();
    return;
  }

  if (target.dataset.action === "open-risk-scale" && target.dataset.scaleKey) {
    startStandaloneScale(target.dataset.scaleKey);
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

  if (target.dataset.action === "open-diagnosis-picker") {
    const rowIndex = Number(target.dataset.index);
    const row = state.diagnosisRows[rowIndex];
    state.diagnosisPicker = { rowIndex, query: row?.diagnosisQuery || row?.diagnosis || "" };
    requestDiagnosisCatalogSearch(state.diagnosisPicker.query, "diagnosis");
    render();
    return;
  }

  if (target.dataset.action === "close-diagnosis-picker") {
    state.diagnosisPicker = null;
    render();
    return;
  }

  if (target.dataset.action === "confirm-diagnosis-picker") {
    state.diagnosisPicker = null;
    render();
    return;
  }

  if (target.dataset.action === "toggle-dx-dropdown") {
    const rowIndex = Number(target.dataset.index);
    state.activeDiagnosisSuggest = state.activeDiagnosisSuggest === rowIndex ? null : rowIndex;
    state.activeCauseSuggest = null;
    state.activeGoalSuggest = null;
    if (state.activeDiagnosisSuggest === rowIndex) {
      const row = state.diagnosisRows[rowIndex];
      requestDiagnosisCatalogSearch(row?.diagnosisQuery || row?.diagnosis || "", "diagnosis");
    }
    render();
    return;
  }

  if (target.dataset.action === "toggle-diseased-organ-dropdown") {
    state.activeDiseasedOrganSuggest = !state.activeDiseasedOrganSuggest;
    if (state.activeDiseasedOrganSuggest && !state.diseasedOrganQuery) state.diseasedOrganQuery = "";
    if (state.activeDiseasedOrganSuggest) requestDiagnosisCatalogSearch(state.diseasedOrganQuery, "cause");
    render();
    return;
  }

  if (target.dataset.action === "add-diseased-organ-custom") {
    addCustomDiseasedOrgan(target.dataset.value);
    render();
    return;
  }

  if (target.dataset.action === "toggle-dx-cause-dropdown") {
    const rowIndex = Number(target.dataset.index);
    state.activeCauseSuggest = state.activeCauseSuggest === rowIndex ? null : rowIndex;
    state.activeDiagnosisSuggest = null;
    state.activeGoalSuggest = null;
    if (state.activeCauseSuggest === rowIndex) {
      const row = state.diagnosisRows[rowIndex];
      if (!causeOptionsForDiagnosis(row).length) requestDiagnosisCatalogSearch(`${row?.diagnosis || ""} ${row?.causeQuery || ""}`, "cause");
    }
    render();
    return;
  }

  if (target.dataset.action === "toggle-dx-goal-dropdown") {
    const rowIndex = Number(target.dataset.index);
    const key = `goal:${rowIndex}`;
    state.activeGoalSuggest = state.activeGoalSuggest === key ? null : key;
    state.activeDiagnosisSuggest = null;
    state.activeCauseSuggest = null;
    render();
    return;
  }

  if (target.dataset.action === "show-diagnosis-detail") {
    const row = state.diagnosisRows[Number(target.dataset.index)];
    alert(diagnosisDetailText(row || createDiagnosisRow()) || "Chưa chọn chẩn đoán.");
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
    state.patient = { ...state.patient, department: "", diagnosis: "" };
    resetForCondition();
    return;
  }

  if (target.dataset.department) {
    state.departmentId = target.dataset.department;
    state.conditionId = currentDepartment().mat_benh[0].id;
    state.search = "";
    state.patient = { ...state.patient, department: "", diagnosis: "" };
    resetForCondition();
    return;
  }

  if (target.dataset.condition) {
    if (target.dataset.categoryRef) state.categoryId = target.dataset.categoryRef;
    if (target.dataset.departmentRef) state.departmentId = target.dataset.departmentRef;
    state.conditionId = target.dataset.condition;
    state.patient = { ...state.patient, department: "", diagnosis: "" };
    resetForCondition();
    return;
  }

  if (target.dataset.level) {
    state.careLevel = target.dataset.level;
    render();
    return;
  }

  if (target.dataset.careFormTab) {
    state.activeCareFormTab = target.dataset.careFormTab;
    render();
    return;
  }

  if (target.dataset.action === "toggle-assessment-card" && target.dataset.assessmentCardKey) {
    const key = target.dataset.assessmentCardKey;
    if (state.openAssessmentCards.has(key)) {
      state.openAssessmentCards.delete(key);
    } else {
      state.openAssessmentCards.add(key);
    }
    render();
    return;
  }

  if (target.dataset.obgynMode) {
    state.assessmentChecklist.obgynMode = target.dataset.obgynMode;
    clearHiddenObgynValues();
    render();
    return;
  }

  if (target.dataset.action === "add-handover-medicine") {
    state.handoverMedicineDraft = createHandoverMedicineRow();
    state.handoverMedicineModalOpen = true;
    render();
    return;
  }

  if (target.dataset.action === "close-handover-medicine") {
    state.handoverMedicineModalOpen = false;
    state.handoverMedicineDraft = createHandoverMedicineRow();
    render();
    return;
  }

  if (target.dataset.action === "save-handover-medicine") {
    const row = normalizeHandoverMedicineRow(state.handoverMedicineDraft);
    if (!cleanLine(row.name)) {
      alert("Vui lòng nhập tên thuốc bàn giao.");
      return;
    }
    state.assessmentChecklist.handoverMedicines.push(row);
    state.handoverMedicineModalOpen = false;
    state.handoverMedicineDraft = createHandoverMedicineRow();
    render();
    return;
  }

  if (target.dataset.action === "remove-handover-medicine") {
    state.assessmentChecklist.handoverMedicines.splice(Number(target.dataset.index), 1);
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

  if (target.dataset.dxCatalogSuggestion !== undefined) {
    const row = state.diagnosisRows[Number(target.dataset.dxCatalogSuggestion)];
    applyNandaCatalogSelection(row, target.dataset.nanda || "");
    state.activeDiagnosisSuggest = null;
    state.activeGoalSuggest = null;
    render();
    return;
  }

  if (target.dataset.action === "add-custom-diagnosis") {
    const row = state.diagnosisRows[Number(target.dataset.index)];
    if (row) {
      row.diagnosis = cleanLine(target.dataset.value);
      row.diagnosisQuery = row.diagnosis;
      row.diagnosisIds = [];
      row.causes = [];
      row.goals = [];
    }
    state.activeDiagnosisSuggest = null;
    state.activeGoalSuggest = null;
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

  if (target.dataset.action === "save-diagnosis-row") {
    const row = state.diagnosisRows[0] || createDiagnosisRow();
    if (!hasCompleteDiagnosisDraft(row)) {
      alert("Vui lòng chọn đủ chẩn đoán, liên quan tới và ít nhất 1 mục tiêu trước khi lưu.");
      return;
    }
    state.diagnosisSavedRows.push(normalizeDiagnosisRowForSave(row));
    state.diagnosisRows = [createDiagnosisRow()];
    state.activeDiagnosisSuggest = null;
    state.activeCauseSuggest = null;
    state.activeGoalSuggest = null;
    render();
    return;
  }

  if (target.dataset.action === "remove-diagnosis") {
    state.diagnosisRows.splice(Number(target.dataset.index), 1);
    if (!state.diagnosisRows.length) state.diagnosisRows.push(createDiagnosisRow());
    render();
    return;
  }

  if (target.dataset.action === "remove-saved-diagnosis") {
    state.diagnosisSavedRows.splice(Number(target.dataset.index), 1);
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

  if (target.dataset.action === "add-custom-goal") {
    const row = state.diagnosisRows[Number(target.dataset.index)];
    const goal = cleanLine(row?.goalQuery);
    if (row && goal) {
      if (!Array.isArray(row.goals)) row.goals = [];
      if (!row.goals.includes(goal)) row.goals.push(goal);
      row.goalQuery = "";
    }
    state.activeGoalSuggest = `goal:${target.dataset.index}`;
    state.activeDiagnosisSuggest = null;
    state.activeCauseSuggest = null;
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

  if (target.dataset.action === "toggle-iv-code-dropdown") {
    state.activeInterventionSuggest = state.activeInterventionSuggest === "draft-code" ? null : "draft-code";
    if (state.activeInterventionSuggest === "draft-code") requestDiagnosisCatalogSearch(state.interventionDraft?.codeQuery || "", "intervention");
    render();
    return;
  }

  if (target.dataset.action === "toggle-iv-content-dropdown") {
    state.activeInterventionSuggest = state.activeInterventionSuggest === "draft-content" ? null : "draft-content";
    if (state.activeInterventionSuggest === "draft-content") requestDiagnosisCatalogSearch(state.interventionDraft?.contentQuery || "", "intervention");
    render();
    return;
  }

  if (target.dataset.action === "save-interventions") {
    const selected = state.interventionDraft?.selected || [];
    if (!selected.length) {
      alert("Vui lòng chọn ít nhất một can thiệp trước khi lưu.");
      return;
    }
    const existing = new Set(state.interventionRows.map((item) => interventionOptionKey({ code: item.code, name: item.content })));
    selected.forEach((item) => {
      const key = interventionOptionKey({ code: item.code, name: item.content });
      if (!existing.has(key)) {
        state.interventionRows.push({
          id: `iv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          selected: true,
          code: item.code,
          content: item.content,
        });
        existing.add(key);
      }
    });
    state.interventionDraft = createInterventionDraft();
    state.activeInterventionSuggest = null;
    render();
    return;
  }

  if (target.dataset.action === "remove-draft-intervention") {
    const selected = [...(state.interventionDraft?.selected || [])];
    selected.splice(Number(target.dataset.index), 1);
    state.interventionDraft = { ...(state.interventionDraft || createInterventionDraft()), selected };
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

  if (target.dataset.action === "add-nanda-goal") {
    const goals = nandaGoalItems();
    goals.push("");
    setNandaGoalItems(goals);
    render();
    return;
  }

  if (target.dataset.action === "remove-nanda-goal") {
    const goals = nandaGoalItems();
    goals.splice(Number(target.dataset.goalIndex), 1);
    setNandaGoalItems(goals);
    render();
    return;
  }

  if (target.dataset.action === "add-nanda-intervention") {
    const rows = nandaInterventionRows();
    rows.push({ code: "", content: "" });
    setNandaInterventionRows(rows);
    render();
    return;
  }

  if (target.dataset.action === "remove-nanda-intervention") {
    const rows = nandaInterventionRows();
    rows.splice(Number(target.dataset.interventionIndex), 1);
    setNandaInterventionRows(rows);
    render();
    return;
  }

  if (target.dataset.action === "toggle-nanda-department") {
    const key = target.dataset.departmentKey;
    if (state.nandaExpandedDepartments.has(key)) {
      state.nandaExpandedDepartments.delete(key);
    } else {
      state.nandaExpandedDepartments.add(key);
    }
    render();
    return;
  }

  if (target.dataset.action === "nanda-page") {
    state.nandaPage = Number(target.dataset.page) || 1;
    render();
    return;
  }

  if (target.dataset.action === "apply-nanda-autofill") {
    const rows = parseNandaAutoFillText(state.nandaAutoFillText);
    state.nandaAutoFillRows = rows;
    state.nandaAutoFillError = rows.length ? "" : "Khong tim thay dong du lieu hop le. Hay dan bang co cot ngan cach bang dau |.";
    if (rows.length) applyNandaAutoFillRow(rows[0]);
    render();
    return;
  }

  if (target.dataset.action === "apply-nanda-autofill-row") {
    const row = state.nandaAutoFillRows[Number(target.dataset.rowIndex)];
    if (row) {
      applyNandaAutoFillRow(row);
      state.nandaAutoFillError = "";
      render();
    }
    return;
  }

  if (target.dataset.action === "clear-nanda-autofill") {
    state.nandaAutoFillText = "";
    state.nandaAutoFillRows = [];
    state.nandaAutoFillError = "";
    render();
    return;
  }

  if (target.dataset.action === "save-nanda") {
    const originalText = target.textContent;
    target.disabled = true;
    target.textContent = "Đang lưu...";
    saveNandaForm()
      .then((saved) => {
        if (saved) alert("Da luu du lieu NANDA.");
      })
      .catch((error) => {
        alert(`Không lưu được dữ liệu NANDA: ${error.message || error}`);
      })
      .finally(() => {
        target.disabled = false;
        target.textContent = originalText;
        if (state.screen === "nanda") render();
      });
    return;
  }

  if (target.dataset.action === "clear-nanda-form") {
    state.nandaEditingId = null;
    state.nandaForm = nandaFormWithLatestDepartment();
    render();
    return;
  }

  if (target.dataset.action === "refresh-nanda") {
    state.nandaLoaded = false;
    loadNandaRows(true);
    render();
    return;
  }

  if (target.dataset.action === "edit-nanda") {
    const row = state.nandaRows.find((item) => String(item.id) === String(target.dataset.nandaId));
    if (!row) {
      alert("Không tìm thấy dòng NANDA để sửa.");
      return;
    }
    state.nandaEditingId = row.id;
    state.nandaForm = {
      ...createDefaultNandaForm(),
      ...normalizeNandaPayload(row),
    };
    render();
    return;
  }

  if (target.dataset.action === "delete-nanda") {
    const row = state.nandaRows.find((item) => String(item.id) === String(target.dataset.nandaId));
    if (!row) {
      alert("Không tìm thấy dòng NANDA để xóa.");
      return;
    }
    if (!confirm(`Xóa dòng NANDA: ${row.van_de || row.ma_can_thiep || row.id}?`)) return;
    deleteNandaRow(row.id)
      .then(() => {
        alert("Đã xóa dòng NANDA.");
      })
      .catch((error) => {
        alert(`Không xóa được dữ liệu NANDA: ${error.message || error}`);
      });
    return;
  }

  if (target.dataset.action === "save-care") {
    const missingTabs = missingCareFormTabs();
    if (missingTabs.length) {
      state.activeCareFormTab = missingTabs[0].id;
      alert(`Các thẻ sau chưa có thông tin: ${missingTabs.map((tab) => tab.label).join(", ")}.\nVui lòng tiếp tục thực hiện ghi phiếu trước khi lưu.`);
      render();
      return;
    }

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
    return;
  }

  if (target.dataset.action === "export-word") {
    exportCareSheetToWord();
    return;
  }

  if (target.dataset.healthEducationStage) {
    state.healthEducationStage = target.dataset.healthEducationStage;
    state.activeHealthEducationStage = target.dataset.healthEducationStage;
    render();
    return;
  }

  if (target.dataset.action === "close-health-education") {
    state.activeHealthEducationStage = null;
    render();
    return;
  }

  if (target.dataset.careListTab) {
    state.careListTab = target.dataset.careListTab;
    render();
    if (state.careListTab === "education") loadCareSheetsForSelectedPatient(true);
    return;
  }

  if (target.dataset.action === "open-scale" && target.dataset.scaleKey) {
    if (isFallRiskScaleKey(target.dataset.scaleKey)) {
      openFallRiskScalePicker(target.dataset.scaleKey);
      render();
      return;
    }
    if (target.dataset.scaleKey === "current_pain") {
      state.assessmentChecklist.current_pain = "yes";
    }
    state.activeScale = target.dataset.scaleKey;
    if (!state.scaleScores[target.dataset.scaleKey]) state.scaleScores[target.dataset.scaleKey] = {};
    const scale = getScaleForKey(target.dataset.scaleKey);
    if (isVasPainScale(scale) && state.scaleScores[target.dataset.scaleKey].vas === undefined) {
      const existingScore = target.dataset.scaleKey === "current_pain"
        ? state.assessmentChecklist.pain_score
        : state.scaleResults[target.dataset.scaleKey]?.total;
      state.scaleScores[target.dataset.scaleKey].vas = existingScore === undefined || existingScore === "" ? 0 : Number(existingScore);
    }
    render();
    return;
  }

  if (target.dataset.action === "close-scale" || target.dataset.action === "close-scale-overlay") {
    state.activeScale = null;
    render();
    return;
  }

  if (target.dataset.action === "close-fall-risk-picker") {
    state.activeFallRiskScalePicker = null;
    render();
    return;
  }

  if (target.dataset.action === "select-fall-risk-scale") {
    startFallRiskScale(target.dataset.fallRiskScale);
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
  if (target.dataset?.diseasedOrganQuery !== undefined && event.key === "Enter") {
    const value = cleanLine(target.value);
    if (value && !diseasedOrganOptions(value).length) {
      event.preventDefault();
      event.stopPropagation();
      addCustomDiseasedOrgan(value);
      render();
      return;
    }
  }
  if (!target.closest?.(".form-mode")) return;
  const isEditableInput = target.matches?.(
    'input:not([type="checkbox"]):not([type="radio"]):not([readonly]):not([disabled]), textarea:not([readonly]):not([disabled])',
  );
  if (!isEditableInput) return;

  if (event.key === "Enter" && !event.ctrlKey && !event.altKey && !event.metaKey && !event.shiftKey) {
    if (focusNextCareInput(target)) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
});

app.addEventListener("focusin", (event) => {
  const target = event.target;
  if (target.dataset.diseasedOrganQuery !== undefined) {
    return;
  }
  if (target.dataset.dxQuery) {
    return;
  }
  if (target.dataset.dxCauseQuery !== undefined) {
    return;
  }
  if (target.dataset.dxGoalQuery !== undefined) {
    return;
  }
});

app.addEventListener("input", (event) => {
  const target = event.target;
  if (target.dataset.input === "search") {
    state.search = target.value;
    render('[data-input="search"]');
    return;
  }

  if (target.dataset.nandaGoalIndex !== undefined) {
    const goals = nandaGoalItems();
    goals[Number(target.dataset.nandaGoalIndex)] = target.value;
    setNandaGoalItems(goals);
    return;
  }

  if (target.dataset.nandaInterventionField) {
    const rows = nandaInterventionRows();
    const index = Number(target.dataset.interventionIndex);
    const field = target.dataset.nandaInterventionField;
    if (rows[index]) {
      rows[index][field] = target.value;
      syncNandaInterventionRow(rows, index, field);
      setNandaInterventionRows(rows);
      const rowElement = target.closest(".nanda-intervention-row");
      if (rowElement) {
        const codeInput = rowElement.querySelector('[data-nanda-intervention-field="code"]');
        const contentInput = rowElement.querySelector('[data-nanda-intervention-field="content"]');
        if (codeInput && codeInput.value !== rows[index].code) codeInput.value = rows[index].code;
        if (contentInput && contentInput.value !== rows[index].content) contentInput.value = rows[index].content;
      }
    }
    return;
  }

  if (target.dataset.nandaSearch !== undefined) {
    state.nandaSearch = target.value;
    state.nandaPage = 1;
    render("[data-nanda-search]");
    return;
  }

  if (target.dataset.nandaAutofillText !== undefined) {
    state.nandaAutoFillText = target.value;
    state.nandaAutoFillError = "";
    return;
  }

  if (target.dataset.nandaField) {
    const field = target.dataset.nandaField;
    state.nandaForm[field] = target.value;
    if (field === "khoa" && isValidNandaDepartment(target.value)) {
      state.nandaForm.khoa = normalizeNandaDepartmentValue(target.value);
      rememberNandaDepartment(state.nandaForm.khoa);
    }
    syncNandaLinkedFields(field);
    updateNandaFormDomFields();
    if (target.dataset.nandaAutosize !== undefined) resizeTextareaToContent(target);
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

  if (target.dataset.gdskNote) {
    const forms = ensureHealthEducationForms();
    const form = forms[target.dataset.gdskNote];
    if (form) form.note = target.value;
    return;
  }

  if (target.dataset.gdskMeta) {
    const [stageKey, field] = target.dataset.gdskMeta.split(":");
    const forms = ensureHealthEducationForms();
    const form = forms[stageKey];
    if (form && ["date", "staffName", "patientSign"].includes(field)) form[field] = target.value;
    return;
  }

  if (target.dataset.vasScale) {
    const scaleKey = target.dataset.vasScale;
    if (!state.scaleScores[scaleKey]) state.scaleScores[scaleKey] = {};
    state.scaleScores[scaleKey].vas = Number(target.value);
    render();
    return;
  }

  if (target.dataset.dxQuery) {
    const rowIndex = Number(target.dataset.dxQuery);
    const row = state.diagnosisRows[rowIndex];
    if (row) {
      row.diagnosisQuery = target.value;
      if (row.diagnosisIds?.length && searchKey(target.value) !== searchKey(row.diagnosis)) {
        row.diagnosisIds = [];
        row.diagnosis = target.value;
        row.causes = [];
        row.goals = [];
        row.causeQuery = "";
        row.goalQuery = "";
      } else if (!row.diagnosisIds?.length) {
        row.diagnosis = target.value;
        row.causes = [];
        row.goals = [];
      }
      state.activeDiagnosisSuggest = rowIndex;
      state.activeCauseSuggest = null;
      state.activeGoalSuggest = null;
      requestDiagnosisCatalogSearch(target.value, "diagnosis");
      render(`[data-dx-query="${target.dataset.dxQuery}"]`);
    }
    return;
  }

  if (target.dataset.dxCauseQuery !== undefined) {
    const rowIndex = Number(target.dataset.dxCauseQuery);
    const row = state.diagnosisRows[rowIndex];
    if (row) {
      row.causeQuery = target.value;
      state.activeCauseSuggest = rowIndex;
      state.activeDiagnosisSuggest = null;
      state.activeGoalSuggest = null;
      if (!causeOptionsForDiagnosis(row).length) requestDiagnosisCatalogSearch(`${row.diagnosis || ""} ${target.value}`, "cause");
      render(`[data-dx-cause-query="${target.dataset.dxCauseQuery}"]`);
    }
    return;
  }

  if (target.dataset.dxGoalQuery !== undefined) {
    const rowIndex = Number(target.dataset.dxGoalQuery);
    const row = state.diagnosisRows[rowIndex];
    if (row) {
      row.goalQuery = target.value;
      state.activeGoalSuggest = `goal:${target.dataset.dxGoalQuery}`;
      state.activeDiagnosisSuggest = null;
      state.activeCauseSuggest = null;
      render(`[data-dx-goal-query="${target.dataset.dxGoalQuery}"]`);
    }
    return;
  }

  if (target.dataset.diseasedOrganQuery !== undefined) {
    state.diseasedOrganQuery = target.value;
    state.activeDiseasedOrganSuggest = true;
    requestDiagnosisCatalogSearch(target.value, "cause");
    render("[data-diseased-organ-query]");
    return;
  }

  if (target.dataset.dxPickerQuery !== undefined) {
    if (state.diagnosisPicker) {
      state.diagnosisPicker.query = target.value;
      requestDiagnosisCatalogSearch(target.value, "diagnosis");
      render(`[data-dx-picker-query="${target.dataset.dxPickerQuery}"]`);
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
    if (target.dataset.ivCodeQuery === "draft") {
      state.interventionDraft.codeQuery = target.value;
      state.activeInterventionSuggest = "draft-code";
      requestDiagnosisCatalogSearch(target.value, "intervention");
      render('[data-iv-code-query="draft"]');
      return;
    }
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
    if (target.dataset.ivContentQuery === "draft") {
      state.interventionDraft.contentQuery = target.value;
      state.activeInterventionSuggest = "draft-content";
      requestDiagnosisCatalogSearch(target.value, "intervention");
      render('[data-iv-content-query="draft"]');
      return;
    }
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

  if (target.dataset.handoverMedicineDraft) {
    const key = target.dataset.handoverMedicineDraft;
    if (Object.hasOwn(createHandoverMedicineRow(), key)) state.handoverMedicineDraft[key] = target.value;
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
  if (target.dataset.dxCauseQuery !== undefined) {
    const row = state.diagnosisRows[Number(target.dataset.dxCauseQuery)];
    const value = cleanLine(target.value);
    if (row && value) {
      row.causes = [value];
      row.causeQuery = value;
      row.goals = (row.goals || []).filter((goal) => goalOptionsForDiagnosisRow(row).includes(goal) || careNandaGoalOptions().some((item) => searchKey(item) === searchKey(goal)));
    }
    state.activeCauseSuggest = null;
    render();
    return;
  }

  if (target.dataset.dxGoalQuery !== undefined) {
    const row = state.diagnosisRows[Number(target.dataset.dxGoalQuery)];
    const value = cleanLine(target.value);
    if (row && value) {
      row.goals = [value];
      row.goalQuery = value;
    }
    state.activeGoalSuggest = null;
    render();
    return;
  }

  if (target.dataset.ivCodeQuery === "draft") {
    const matched = findInterventionByCode(target.value);
    if (matched) {
      state.interventionDraft.codeQuery = matched.code;
      state.interventionDraft.contentQuery = matched.name;
      toggleInterventionDraftSelection(matched, true);
    }
    render();
    return;
  }

  if (target.dataset.ivContentQuery === "draft") {
    const matched = findInterventionByName(target.value);
    if (matched) {
      state.interventionDraft.codeQuery = matched.code;
      state.interventionDraft.contentQuery = matched.name;
      toggleInterventionDraftSelection(matched, true);
    }
    render();
    return;
  }

  if (target.dataset.nandaDepartmentFilter !== undefined) {
    state.nandaDepartmentFilter = target.value;
    state.nandaPage = 1;
    render();
    return;
  }

  if (target.dataset.nandaGroupFilter !== undefined) {
    state.nandaGroupFilter = target.value;
    state.nandaPage = 1;
    render();
    return;
  }

  if (target.dataset.nandaInterventionField) {
    const rows = nandaInterventionRows();
    const index = Number(target.dataset.interventionIndex);
    const field = target.dataset.nandaInterventionField;
    if (rows[index]) {
      rows[index][field] = target.value;
      syncNandaInterventionRow(rows, index, field);
      setNandaInterventionRows(rows);
      const rowElement = target.closest(".nanda-intervention-row");
      if (rowElement) {
        const codeInput = rowElement.querySelector('[data-nanda-intervention-field="code"]');
        const contentInput = rowElement.querySelector('[data-nanda-intervention-field="content"]');
        if (codeInput && codeInput.value !== rows[index].code) codeInput.value = rows[index].code;
        if (contentInput && contentInput.value !== rows[index].content) contentInput.value = rows[index].content;
      }
    }
    return;
  }

  if (target.dataset.nandaField) {
    const field = target.dataset.nandaField;
    state.nandaForm[field] = target.value;
    syncNandaLinkedFields(field);
    if (field === "khoa" && cleanLine(target.value) && !isValidNandaDepartment(target.value)) {
      state.nandaForm.khoa = "";
      alert("Khoa phai chon trong danh muc goi y tu dmkhoa.json.");
    } else if (field === "khoa") {
      state.nandaForm.khoa = normalizeNandaDepartmentValue(target.value);
      if (state.nandaForm.khoa) rememberNandaDepartment(state.nandaForm.khoa);
    }
    updateNandaFormDomFields();
    if (target.dataset.nandaAutosize !== undefined) resizeTextareaToContent(target);
    const problemDatalist = document.getElementById("nanda-problem-options");
    if (problemDatalist) {
      problemDatalist.outerHTML = renderDatalist("nanda-problem-options", nandaProblemOptions());
    }
    return;
  }

  if (target.dataset.categorySelect !== undefined) {
    state.categoryId = target.value;
    state.departmentId = currentCategory().khoa[0].id;
    state.conditionId = currentDepartment().mat_benh[0].id;
    state.search = "";
    state.patient = { ...state.patient, department: "", diagnosis: "" };
    resetForCondition();
    return;
  }

  if (target.dataset.departmentSelect !== undefined) {
    state.departmentId = target.value;
    state.conditionId = currentDepartment().mat_benh[0].id;
    state.search = "";
    state.patient = { ...state.patient, department: "", diagnosis: "" };
    resetForCondition();
    return;
  }

  if (target.dataset.scaleCheck) {
    const scaleKey = target.dataset.scaleCheck;
    state.assessmentChecklist[scaleKey] = target.checked;
    if (target.checked) {
      if (isFallRiskScaleKey(scaleKey)) {
        openFallRiskScalePicker(scaleKey);
        render();
        return;
      }
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
    if (target.dataset.checklistBool === "circulationOtherChecked" && !target.checked) {
      state.assessmentChecklist.circulationOther = "";
    }
    if (target.dataset.checklistBool === "pathologicalDiet" && !target.checked) {
      state.assessmentChecklist.pathologicalDietTypes = [];
      state.assessmentChecklist.pathologicalDietOther = "";
    }
    if (target.dataset.checklistBool === "obgynEnabled" && !target.checked) {
      state.assessmentChecklist.obgynMode = "";
      (state.obgynTemplate?.sections || []).forEach((section) => clearObgynFieldValues(section.fields || []));
    }
    if (target.dataset.checklistBool === "handoverMedicineHalf" && !target.checked) {
      state.assessmentChecklist.handoverMedicines = [];
      state.handoverMedicineModalOpen = false;
      state.handoverMedicineDraft = createHandoverMedicineRow();
    }
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

  if (target.dataset.scaleMultiItem) {
    const [scaleKey, itemKey] = target.dataset.scaleMultiItem.split(":");
    const [optionIndexText, scoreText] = String(target.value || "").split(":");
    const optionIndex = Number(optionIndexText);
    const score = Number(scoreText);
    const optionValue = `${optionIndex}:${score}`;
    if (!state.scaleScores[scaleKey]) state.scaleScores[scaleKey] = {};
    const current = Array.isArray(state.scaleScores[scaleKey][itemKey]) ? [...state.scaleScores[scaleKey][itemKey]] : [];
    if (target.checked && score === 0) {
      state.scaleScores[scaleKey][itemKey] = [optionValue];
    } else {
      let next = current.filter((value) => Number(String(value).split(":").pop()) !== 0);
      if (target.checked && !next.includes(optionValue)) next.push(optionValue);
      if (!target.checked) {
        const removeAt = next.findIndex((value) => String(value) === optionValue);
        if (removeAt >= 0) next.splice(removeAt, 1);
      }
      state.scaleScores[scaleKey][itemKey] = next.length ? next : ["0:0"];
    }
    render();
    return;
  }

  if (target.dataset.gdskRadio) {
    const [stageKey, indexText, field] = target.dataset.gdskRadio.split(":");
    const forms = ensureHealthEducationForms();
    const item = forms[stageKey]?.items?.[Number(indexText)];
    if (item && (field === "need" || field === "result")) item[field] = target.value;
    return;
  }

  if (target.dataset.dxCatalogCheck !== undefined) {
    const row = state.diagnosisRows[Number(target.dataset.dxCatalogCheck)];
    toggleNandaCatalogSelection(row, target.dataset.nanda || "", target.checked);
    state.activeDiagnosisSuggest = null;
    state.activeCauseSuggest = null;
    state.activeGoalSuggest = null;
    render();
    return;
  }

  if (target.dataset.dxCustomCheck !== undefined) {
    const row = state.diagnosisRows[Number(target.dataset.dxCustomCheck)];
    if (row) {
      const value = cleanLine(target.dataset.value);
      if (target.checked) {
        row.diagnosis = value;
        row.diagnosisQuery = value;
        row.diagnosisIds = [];
        row.causes = [];
        row.goals = [];
      } else if (searchKey(row.diagnosis) === searchKey(value)) {
        row.diagnosis = "";
      }
    }
    state.activeDiagnosisSuggest = null;
    state.activeCauseSuggest = null;
    state.activeGoalSuggest = null;
    render();
    return;
  }

  if (target.dataset.dxCustomGoalCheck !== undefined) {
    const row = state.diagnosisRows[Number(target.dataset.dxCustomGoalCheck)];
    const goal = cleanLine(target.dataset.value);
    if (row && goal) {
      row.goals = target.checked ? [goal] : [];
      row.goalQuery = target.checked ? goal : "";
    }
    state.activeGoalSuggest = null;
    state.activeDiagnosisSuggest = null;
    state.activeCauseSuggest = null;
    render();
    return;
  }

  if (target.dataset.dxPickerOption !== undefined) {
    const row = state.diagnosisRows[Number(target.dataset.dxPickerOption)];
    if (row) {
      const nanda = target.dataset.nanda || "";
      const ids = diagnosisCatalogRows()
        .filter((item) => cleanLine(item.nanda) === nanda)
        .map((item) => String(item.id));
      const current = new Set((row.diagnosisIds || []).map(String));
      if (target.checked) ids.forEach((id) => current.add(id));
      if (!target.checked) ids.forEach((id) => current.delete(id));
      row.diagnosisIds = [...current];
      const selectedNandas = [...new Set(
        diagnosisCatalogRows()
          .filter((item) => row.diagnosisIds.includes(String(item.id)))
          .map((item) => cleanLine(item.nanda)),
      )];
      row.diagnosis = selectedNandas.join("; ");
      row.diagnosisQuery = row.diagnosis;
      row.causes = (row.causes || []).filter((cause) =>
        causeOptionsForDiagnosis(row).some((item) => item.cause === cause),
      );
      row.goals = (row.goals || []).filter((goal) =>
        goalOptionsForDiagnosisRow(row).includes(goal),
      );
    }
    render();
    return;
  }

  if (target.dataset.ivOptionCheck) {
    const item = {
      code: target.dataset.code || "",
      name: target.dataset.content || "",
    };
    toggleInterventionDraftSelection(item, target.checked);
    state.interventionDraft.codeQuery = target.checked && target.dataset.ivOptionCheck === "code" ? item.code : state.interventionDraft.codeQuery;
    state.interventionDraft.contentQuery = target.checked && target.dataset.ivOptionCheck === "content" ? item.name : state.interventionDraft.contentQuery;
    state.activeInterventionSuggest = target.dataset.ivOptionCheck === "code" ? "draft-code" : "draft-content";
    render();
    return;
  }

  if (target.dataset.diseasedOrganCheck !== undefined) {
    const values = diseasedOrganSelectedItems();
    const value = cleanLine(target.dataset.value);
    const index = values.findIndex((item) => searchKey(item) === searchKey(value));
    if (target.checked && index < 0) values.push(value);
    if (!target.checked && index >= 0) values.splice(index, 1);
    setDiseasedOrganSelectedItems(values);
    state.diseasedOrganQuery = "";
    state.activeDiseasedOrganSuggest = false;
    render();
    return;
  }

  if (target.dataset.diseasedOrganCustomCheck !== undefined) {
    if (target.checked) addCustomDiseasedOrgan(target.dataset.value);
    render();
    return;
  }

  if (target.dataset.dxCause !== undefined) {
    const row = state.diagnosisRows[Number(target.dataset.dxCause)];
    if (row) {
      row.causes = target.checked ? [target.value] : [];
      row.causeQuery = target.checked ? target.value : "";
      row.goals = (row.goals || []).filter((goal) => goalOptionsForDiagnosisRow(row).includes(goal));
    }
    state.activeCauseSuggest = null;
    state.activeDiagnosisSuggest = null;
    state.activeGoalSuggest = null;
    render();
    return;
  }

  if (target.dataset.dxGoal !== undefined) {
    const row = state.diagnosisRows[Number(target.dataset.dxGoal)];
    if (row) {
      row.goals = target.checked ? [target.value] : [];
      row.goalQuery = target.checked ? target.value : "";
    }
    state.activeGoalSuggest = null;
    state.activeDiagnosisSuggest = null;
    state.activeCauseSuggest = null;
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
    if (target.checked && key === "neuroFocalSigns") {
      if (target.value === "Bình thường") {
        values.splice(0, values.length, "Bình thường");
        state.assessmentChecklist.neuroFocalSignsOther = "";
      } else {
        const normalIndex = values.indexOf("Bình thường");
        if (normalIndex >= 0) values.splice(normalIndex, 1);
      }
    }
    state.assessmentChecklist[key] = values;
    if (target.checked && key === "neuroBehavior") {
      state.assessmentChecklist.neuroBehaviorStatus = "";
    }
    if (key === "neuroBehavior" && !values.includes("Khác")) {
      state.assessmentChecklist.neuroBehaviorOther = "";
    }
    if (key === "neuroFocalSigns" && !values.includes("Khác")) {
      state.assessmentChecklist.neuroFocalSignsOther = "";
    }
    if (key === "neuroConsciousness" && !values.includes("Khác")) {
      state.assessmentChecklist.neuroConsciousnessOther = "";
    }
    if (key === "nutritionRegimen" && !values.includes("Khác")) {
      state.assessmentChecklist.nutritionRegimenOther = "";
    }
    if (key === "pathologicalDietTypes" && !values.includes("Khác")) {
      state.assessmentChecklist.pathologicalDietOther = "";
    }
    if (key === "mobilityAbility" && !values.includes("Khác")) {
      state.assessmentChecklist.mobilityAbilityOther = "";
    }
    if (key === "muscleStrength" && !values.includes("Khác")) {
      state.assessmentChecklist.muscleStrengthOther = "";
    }
    if (key === "movementStatus" && !values.includes("Khác")) {
      state.assessmentChecklist.movementStatusOther = "";
    }
    if (key === "painLocation" && !values.includes("Khác")) {
      state.assessmentChecklist.painLocationOther = "";
    }
    if (key === "painCharacter" && !values.includes("Khác")) {
      state.assessmentChecklist.painCharacterOther = "";
    }
    if (key === "nauseaVomiting" && !values.includes("Khác")) {
      state.assessmentChecklist.nauseaVomitingOther = "";
    }
    if (key === "flatus" && !values.includes("Khác")) {
      state.assessmentChecklist.flatusOther = "";
    }
    if (key === "stool" && !values.includes("Khác")) {
      state.assessmentChecklist.stoolOther = "";
    }
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
      clearAllergyDetails();
    }
    if (target.dataset.checklistRadio === "breathingMode" && target.value !== "Thở máy") {
      state.assessmentChecklist.ventilationAirway = [];
    }
    if (target.dataset.checklistRadio === "neuroConsciousness" && target.value !== "Khác") {
      state.assessmentChecklist.neuroConsciousnessOther = "";
    }
    if (target.dataset.checklistRadio === "neuroOrientation" && target.value !== "Khác") {
      state.assessmentChecklist.neuroOrientationOther = "";
    }
    if (target.dataset.checklistRadio === "neuroBehaviorStatus" && target.value === "Bình thường") {
      state.assessmentChecklist.neuroBehavior = [];
      state.assessmentChecklist.neuroBehaviorOther = "";
    }
    if (target.dataset.checklistRadio === "neuroFocalSignsStatus" && target.value === "Bình thường") {
      state.assessmentChecklist.neuroFocalSigns = [];
      state.assessmentChecklist.neuroFocalSignsOther = "";
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
    return;
  }
});

async function init() {
  try {
    const [response, scaleResponse, assessmentResponse, interventionCodeResponse, obgynResponse, problemResponse, departmentResponse] = await Promise.all([
      fetch("./cd_deu_duong.json"),
      fetch("./thangdiem.json"),
      fetch("./nhan_dinh.json"),
      fetch("./ma_can_thiep.json"),
      fetch("./sankhoa.json"),
      fetch("./vande.json"),
      fetch("./dmkhoa.json"),
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
    if (obgynResponse.ok) {
      state.obgynTemplate = deepFix(await obgynResponse.json());
    }
    if (problemResponse.ok) {
      state.problemCatalog = deepFix(await problemResponse.json());
    }
    if (departmentResponse.ok) {
      state.departmentCatalog = deepFix(await departmentResponse.json());
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
