(function () {
  const root = document.querySelector("#nanda-public-root");
  const state = {
    rows: [],
    loading: true,
    syncing: false,
    error: "",
    realtimeStatus: "",
    realtimeChannel: null,
    search: "",
    department: "",
    group: "",
  };

  function h(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function clean(value) {
    return String(value ?? "").replace(/\s+/g, " ").trim();
  }

  function searchKey(value) {
    return clean(value)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\u0111/g, "d")
      .replace(/\u0110/g, "d");
  }

  function uniqueValues(values) {
    const seen = new Set();
    return values
      .map(clean)
      .filter(Boolean)
      .filter((value) => {
        const key = searchKey(value);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => a.localeCompare(b, "vi"));
  }

  function splitLines(value) {
    return String(value ?? "")
      .split(/\r?\n|;/)
      .map(clean)
      .filter(Boolean);
  }

  function rowSearchText(row) {
    return [
      row.khoa,
      row.nhom_van_de,
      row.van_de,
      row.nguyen_nhan,
      row.muc_tieu_can_thiep,
      row.ma_can_thiep,
      row.noi_dung_can_thiep,
    ].join(" ");
  }

  function filteredRows() {
    const query = searchKey(state.search);
    const department = searchKey(state.department);
    const group = searchKey(state.group);
    return state.rows.filter((row) => {
      if (department && searchKey(row.khoa) !== department) return false;
      if (group && searchKey(row.nhom_van_de) !== group) return false;
      if (query && !searchKey(rowSearchText(row)).includes(query)) return false;
      return true;
    });
  }

  function renderLineList(value) {
    const lines = splitLines(value);
    if (!lines.length) return '<span class="nanda-public-muted">Chua co</span>';
    return `<ul>${lines.map((line) => `<li>${h(line)}</li>`).join("")}</ul>`;
  }

  function renderRows(rows) {
    if (!rows.length) {
      return '<div class="nanda-public-empty">Khong tim thay dong NANDA phu hop.</div>';
    }

    return `
      <div class="nanda-public-table-wrap">
        <table class="nanda-public-table">
          <thead>
            <tr>
              <th>Khoa</th>
              <th>Nhom van de</th>
              <th>Van de</th>
              <th>Nguyen nhan</th>
              <th>Muc tieu</th>
              <th>Ma can thiep</th>
              <th>Noi dung can thiep</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((row) => `
              <tr>
                <td>${h(clean(row.khoa) || "Chua co khoa")}</td>
                <td>${h(row.nhom_van_de)}</td>
                <td><strong>${h(row.van_de)}</strong></td>
                <td>${renderLineList(row.nguyen_nhan)}</td>
                <td>${renderLineList(row.muc_tieu_can_thiep)}</td>
                <td>${renderLineList(row.ma_can_thiep)}</td>
                <td>${renderLineList(row.noi_dung_can_thiep)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function render() {
    const departments = uniqueValues(state.rows.map((row) => row.khoa));
    const groups = uniqueValues(state.rows.map((row) => row.nhom_van_de));
    const rows = filteredRows();

    root.innerHTML = `
      <section class="nanda-public-hero">
        <div>
          <p class="nanda-public-eyebrow">Danh muc can thiep</p>
          <h1>Bang NANDA</h1>
          <p>${state.loading ? "Dang tai du lieu..." : `${rows.length}/${state.rows.length} dong du lieu tu bang public.nanda`}</p>
        </div>
        <a class="btn ghost nanda-public-home" href="/">Ve trang chinh</a>
      </section>
      <section class="nanda-public-card">
        <div class="nanda-public-toolbar">
          <label>
            <span>Tim kiem</span>
            <input type="search" data-public-nanda-search value="${h(state.search)}" placeholder="Tim theo khoa, van de, ma, can thiep" />
          </label>
          <label>
            <span>Khoa</span>
            <select data-public-nanda-department>
              <option value="">Tat ca khoa</option>
              ${departments.map((department) => `
                <option value="${h(department)}" ${searchKey(state.department) === searchKey(department) ? "selected" : ""}>${h(department)}</option>
              `).join("")}
            </select>
          </label>
          <label>
            <span>Nhom van de</span>
            <select data-public-nanda-group>
              <option value="">Tat ca nhom</option>
              ${groups.map((group) => `
                <option value="${h(group)}" ${searchKey(state.group) === searchKey(group) ? "selected" : ""}>${h(group)}</option>
              `).join("")}
            </select>
          </label>
          <button type="button" class="btn" data-public-nanda-refresh ${state.loading || state.syncing ? "disabled" : ""}>Dong bo</button>
          <span class="nanda-public-sync-status">${h(state.realtimeStatus || "Realtime san sang")}</span>
        </div>
        ${state.error ? `<div class="nanda-public-error">Khong tai duoc bang NANDA: ${h(state.error)}</div>` : ""}
        ${state.loading ? '<div class="nanda-public-loading">Dang tai du lieu NANDA...</div>' : renderRows(rows)}
      </section>
    `;
  }

  function getClient() {
    const config = window.SUPABASE_CONFIG || {};
    if (!window.supabase || !config.url || !config.anonKey) {
      throw new Error("Chua cau hinh Supabase.");
    }
    return window.supabase.createClient(config.url, config.anonKey);
  }

  async function fetchAllNandaRows() {
    const client = getClient();
    const pageSize = 1000;
    let from = 0;
    const rows = [];

    for (;;) {
      const to = from + pageSize - 1;
      const { data, error } = await client
        .from("nanda")
        .select("id,khoa,nhom_van_de,van_de,nguyen_nhan,muc_tieu_can_thiep,ma_can_thiep,noi_dung_can_thiep,created_at")
        .order("khoa", { ascending: true })
        .order("nhom_van_de", { ascending: true })
        .order("van_de", { ascending: true })
        .range(from, to);

      if (error) throw error;
      rows.push(...(data || []));
      if (!data || data.length < pageSize) break;
      from += pageSize;
    }

    return rows;
  }

  async function loadRows() {
    state.loading = true;
    state.error = "";
    render();

    try {
      state.rows = await fetchAllNandaRows();
    } catch (error) {
      state.rows = [];
      state.error = error.message || String(error);
    } finally {
      state.loading = false;
      render();
    }
  }

  async function syncRows() {
    state.syncing = true;
    render();
    try {
      await loadRows();
    } finally {
      state.syncing = false;
      render();
    }
  }

  function setupRealtimeSync() {
    if (state.realtimeChannel) return;
    try {
      const client = getClient();
      state.realtimeStatus = "Dang ket noi realtime";
      state.realtimeChannel = client
        .channel("public:nanda:public-sync")
        .on("postgres_changes", { event: "*", schema: "public", table: "nanda" }, async () => {
          state.realtimeStatus = "Dang dong bo thay doi moi";
          await loadRows();
          state.realtimeStatus = "Realtime da cap nhat";
          render();
        })
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            state.realtimeStatus = "Realtime dang bat";
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
            state.realtimeStatus = "Realtime chua ket noi";
          }
          render();
        });
    } catch (error) {
      state.realtimeStatus = `Realtime loi: ${error.message || error}`;
    }
  }

  root.addEventListener("input", (event) => {
    const target = event.target;
    if (target.dataset.publicNandaSearch !== undefined) {
      state.search = target.value;
      render();
    }
  });

  root.addEventListener("change", (event) => {
    const target = event.target;
    if (target.dataset.publicNandaDepartment !== undefined) {
      state.department = target.value;
      render();
    }
    if (target.dataset.publicNandaGroup !== undefined) {
      state.group = target.value;
      render();
    }
  });

  root.addEventListener("click", (event) => {
    const target = event.target.closest("[data-public-nanda-refresh]");
    if (target) syncRows();
  });

  setupRealtimeSync();
  loadRows();
})();
