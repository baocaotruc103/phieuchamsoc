-- Insert/upsert danh sach benh nhan mau vao bang dsbn
-- Chay sau supabase.sql.

CREATE UNIQUE INDEX IF NOT EXISTS idx_dsbn_ma_benh_nhan_unique ON dsbn(ma_benh_nhan);

INSERT INTO dsbn (ma_benh_nhan, ho_ten, tuoi, gioi_tinh, phong, giuong, khoa, chan_doan_y_khoa)
VALUES
  ('23126929', 'NGUYỄN THỊ HƯỞNG', 76, 'Nữ', NULL, NULL, NULL, NULL),
  ('26060524', 'LÊ THỊ XUYẾN', 95, 'Nữ', 'Hồi sức tích cực bổ sung thêm 3', NULL, NULL, NULL),
  ('26078296', 'NGUYỄN TIẾN HUỲNH', 35, 'Nam', 'Hồi sức tích cực bổ sung thêm 7', NULL, NULL, NULL),
  ('25068076', 'NGUYỄN VĂN HÙNG', 73, 'Nam', NULL, NULL, NULL, NULL),
  ('26078061', 'BÙI XUÂN HÒA', 17, 'Nam', NULL, NULL, NULL, NULL),
  ('26055114', 'CHU VĂN LAN', 69, 'Nam', NULL, NULL, NULL, NULL),
  ('26076897', 'HÀ THỊ TƯƠNG', 53, 'Nữ', NULL, NULL, NULL, NULL),
  ('26077344', 'NGUYỄN THANH HÀ', 57, 'Nam', NULL, NULL, NULL, NULL),
  ('26077163', 'NGUYỄN ĐẮC THẮNG', 22, 'Nam', NULL, NULL, NULL, NULL),
  ('26067081', 'VŨ VĂN NGHĨA', 67, 'Nam', 'Hồi sức tích cực 5', NULL, NULL, NULL)
ON CONFLICT (ma_benh_nhan) DO UPDATE SET
  ho_ten = EXCLUDED.ho_ten,
  tuoi = EXCLUDED.tuoi,
  gioi_tinh = EXCLUDED.gioi_tinh,
  phong = EXCLUDED.phong,
  giuong = EXCLUDED.giuong,
  khoa = EXCLUDED.khoa,
  chan_doan_y_khoa = EXCLUDED.chan_doan_y_khoa,
  updated_at = CURRENT_TIMESTAMP;
