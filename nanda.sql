-- Supabase/PostgreSQL schema for NANDA intervention reference data.
-- Run this in Supabase SQL Editor.

create table if not exists public.nanda (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  nhom_van_de text not null,
  van_de text not null,
  nguyen_nhan text,
  muc_tieu_can_thiep text,
  ma_can_thiep text,
  noi_dung_can_thiep text not null
);

comment on table public.nanda is 'Bang danh muc NANDA va can thiep dieu duong';
comment on column public.nanda.nhom_van_de is 'Nhom van de';
comment on column public.nanda.van_de is 'Van de';
comment on column public.nanda.nguyen_nhan is 'Nguyen nhan';
comment on column public.nanda.muc_tieu_can_thiep is 'Muc tieu can thiep';
comment on column public.nanda.ma_can_thiep is 'Ma can thiep';
comment on column public.nanda.noi_dung_can_thiep is 'Noi dung can thiep';

create index if not exists idx_nanda_nhom_van_de
  on public.nanda (nhom_van_de);

create index if not exists idx_nanda_van_de
  on public.nanda (van_de);

create index if not exists idx_nanda_ma_can_thiep
  on public.nanda (ma_can_thiep);

alter table public.nanda enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.nanda to anon, authenticated;
grant usage, select on sequence public.nanda_id_seq to anon, authenticated;

drop policy if exists "Allow public nanda read" on public.nanda;
drop policy if exists "Allow public nanda insert" on public.nanda;
drop policy if exists "Allow public nanda update" on public.nanda;
drop policy if exists "Allow public nanda delete" on public.nanda;
drop policy if exists "Full access nanda" on public.nanda;

create policy "Full access nanda"
  on public.nanda
  for all
  to anon, authenticated
  using (true)
  with check (true);
