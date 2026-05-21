-- Supabase table for the feedback form in danhgia.json
-- Run this in Supabase SQL Editor.

create table if not exists public.danh_gia_mau_phieu_cham_soc (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- 1. Thong tin nguoi dung
  full_name text,
  department text not null,

  -- 2. Danh gia trai nghiem su dung ung dung
  ui_easy text,
  layout text,
  work_support text,
  info_clear text,
  real_need text,

  -- 3. Muc do hai long chung
  satisfaction text,

  -- 4. Chuc nang mong muon bo sung
  wanted_features text[] not null default '{}',
  other_feature text,

  -- 5. Dong gop y kien
  liked_most text,
  need_improve text,
  new_suggestion text,

  -- 6. Danh gia tong the
  overall text,

  -- 7. Danh gia ve mau phieu cham soc dien tu
  current_care_form text,
  emr_apply_wish text,
  nursing_effectiveness text,

  -- Raw payload for forward compatibility if the form changes later.
  payload jsonb not null default '{}'::jsonb
);

create index if not exists idx_danh_gia_mau_phieu_created_at
  on public.danh_gia_mau_phieu_cham_soc (created_at desc);

create index if not exists idx_danh_gia_mau_phieu_department
  on public.danh_gia_mau_phieu_cham_soc (department);

alter table public.danh_gia_mau_phieu_cham_soc enable row level security;

grant usage on schema public to anon, authenticated;
grant insert, select on public.danh_gia_mau_phieu_cham_soc to anon;
grant select on public.danh_gia_mau_phieu_cham_soc to authenticated;

-- Public form can insert feedback with the anon key.
drop policy if exists "Allow public feedback insert" on public.danh_gia_mau_phieu_cham_soc;
create policy "Allow public feedback insert"
  on public.danh_gia_mau_phieu_cham_soc
  for insert
  to anon
  with check (department is not null and length(trim(department)) > 0);

-- Public dashboard at /danhgia can read feedback results with the anon key.
drop policy if exists "Allow authenticated feedback read" on public.danh_gia_mau_phieu_cham_soc;
drop policy if exists "Allow public feedback read" on public.danh_gia_mau_phieu_cham_soc;
create policy "Allow public feedback read"
  on public.danh_gia_mau_phieu_cham_soc
  for select
  to anon
  using (true);
