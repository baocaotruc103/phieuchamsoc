-- Supabase/PostgreSQL schema for nursing care sheets

CREATE TABLE IF NOT EXISTS dsbn (
    id BIGSERIAL PRIMARY KEY,
    ma_benh_nhan VARCHAR(50),
    ho_ten VARCHAR(255) NOT NULL,
    tuoi INTEGER,
    gioi_tinh VARCHAR(20),
    phong VARCHAR(50),
    giuong VARCHAR(50),
    khoa VARCHAR(255),
    chan_doan_y_khoa TEXT,
    ngay_vao DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS danh_sach_phieu_cs (
    id BIGSERIAL PRIMARY KEY,
    benh_nhan_id BIGINT NOT NULL REFERENCES dsbn(id) ON DELETE CASCADE,
    ma_phieu VARCHAR(50),
    cap_cham_soc VARCHAR(10),
    thoi_gian_danh_gia TIMESTAMP,
    nguoi_danh_gia VARCHAR(255),
    nhan_dinh_json JSONB,
    chan_doan_muc_tieu_json JSONB,
    can_thiep_json JSONB,
    ban_giao_json JSONB,
    thang_diem_json JSONB,
    ghi_chu TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS danh_gia_ket_qua (
    id BIGSERIAL PRIMARY KEY,
    phieu_cs_id BIGINT NOT NULL REFERENCES danh_sach_phieu_cs(id) ON DELETE CASCADE,
    thoi_gian_dat_muc_tieu TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    muc_tieu TEXT NOT NULL,
    danh_gia VARCHAR(20) CHECK (danh_gia IS NULL OR danh_gia = '' OR danh_gia IN ('Đạt', 'Không đạt')),
    thoi_gian_ket_thuc_muc_tieu TIMESTAMP
);

ALTER TABLE danh_gia_ket_qua
    ALTER COLUMN danh_gia DROP NOT NULL,
    ALTER COLUMN thoi_gian_ket_thuc_muc_tieu DROP NOT NULL,
    ALTER COLUMN thoi_gian_ket_thuc_muc_tieu DROP DEFAULT;

ALTER TABLE danh_gia_ket_qua
    DROP CONSTRAINT IF EXISTS danh_gia_ket_qua_danh_gia_check,
    ADD CONSTRAINT danh_gia_ket_qua_danh_gia_check
    CHECK (danh_gia IS NULL OR danh_gia = '' OR danh_gia IN ('Đạt', 'Không đạt'));

CREATE INDEX IF NOT EXISTS idx_dsbn_ma_benh_nhan ON dsbn(ma_benh_nhan);
CREATE INDEX IF NOT EXISTS idx_phieu_cs_benh_nhan_id ON danh_sach_phieu_cs(benh_nhan_id);
CREATE INDEX IF NOT EXISTS idx_danh_gia_phieu_cs_id ON danh_gia_ket_qua(phieu_cs_id);
CREATE INDEX IF NOT EXISTS idx_danh_gia_thoi_gian ON danh_gia_ket_qua(thoi_gian_dat_muc_tieu);

ALTER TABLE dsbn ENABLE ROW LEVEL SECURITY;
ALTER TABLE danh_sach_phieu_cs ENABLE ROW LEVEL SECURITY;
ALTER TABLE danh_gia_ket_qua ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Full access dsbn" ON dsbn;
DROP POLICY IF EXISTS "Full access danh_sach_phieu_cs" ON danh_sach_phieu_cs;
DROP POLICY IF EXISTS "Full access danh_gia_ket_qua" ON danh_gia_ket_qua;

CREATE POLICY "Full access dsbn"
ON dsbn
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Full access danh_sach_phieu_cs"
ON danh_sach_phieu_cs
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Full access danh_gia_ket_qua"
ON danh_gia_ket_qua
FOR ALL
USING (true)
WITH CHECK (true);
