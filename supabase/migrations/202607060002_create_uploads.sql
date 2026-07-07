create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.upload_batches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  reporting_year integer,
  status text not null default 'draft'
    check (status in ('draft', 'uploaded', 'parsed', 'warning', 'failed')),
  file_count integer not null default 0 check (file_count >= 0),
  warning_count integer not null default 0 check (warning_count >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  upload_batch_id uuid not null references public.upload_batches(id) on delete cascade,
  file_name text not null,
  file_type text not null default 'unknown',
  file_size_bytes integer not null default 0 check (file_size_bytes >= 0),
  row_count integer not null default 0 check (row_count >= 0),
  status text not null default 'uploaded'
    check (status in ('uploaded', 'parsed', 'warning', 'failed')),
  storage_path text,
  headers_json jsonb not null default '[]'::jsonb,
  preview_rows_json jsonb not null default '[]'::jsonb,
  warnings_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists upload_batches_user_id_idx
  on public.upload_batches (user_id);

create index if not exists uploads_user_id_idx
  on public.uploads (user_id);

create index if not exists uploads_upload_batch_id_idx
  on public.uploads (upload_batch_id);

alter table public.upload_batches enable row level security;
alter table public.uploads enable row level security;

drop policy if exists "Users can read their own upload batches" on public.upload_batches;
create policy "Users can read their own upload batches"
  on public.upload_batches
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create their own upload batches" on public.upload_batches;
create policy "Users can create their own upload batches"
  on public.upload_batches
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own upload batches" on public.upload_batches;
create policy "Users can update their own upload batches"
  on public.upload_batches
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own upload batches" on public.upload_batches;
create policy "Users can delete their own upload batches"
  on public.upload_batches
  for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can read their own uploads" on public.uploads;
create policy "Users can read their own uploads"
  on public.uploads
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create their own uploads" on public.uploads;
create policy "Users can create their own uploads"
  on public.uploads
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own uploads" on public.uploads;
create policy "Users can update their own uploads"
  on public.uploads
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own uploads" on public.uploads;
create policy "Users can delete their own uploads"
  on public.uploads
  for delete
  using (auth.uid() = user_id);

drop trigger if exists set_upload_batches_updated_at on public.upload_batches;
create trigger set_upload_batches_updated_at
  before update on public.upload_batches
  for each row
  execute function public.set_updated_at();

drop trigger if exists set_uploads_updated_at on public.uploads;
create trigger set_uploads_updated_at
  before update on public.uploads
  for each row
  execute function public.set_updated_at();
