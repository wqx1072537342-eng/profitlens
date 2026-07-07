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

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  upload_batch_id uuid not null references public.upload_batches(id) on delete cascade,
  status text not null default 'preview'
    check (status in ('preview', 'ready', 'failed')),
  currency text not null default 'USD',
  gross_sales numeric(12, 2) not null default 0,
  refunds numeric(12, 2) not null default 0,
  fees numeric(12, 2) not null default 0,
  ads numeric(12, 2) not null default 0,
  shipping numeric(12, 2) not null default 0,
  tax_collected numeric(12, 2) not null default 0,
  net_profit_before_cogs numeric(12, 2) not null default 0,
  net_profit_after_cogs numeric(12, 2) not null default 0,
  warnings_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists reports_user_id_idx
  on public.reports (user_id);

create index if not exists reports_upload_batch_id_idx
  on public.reports (upload_batch_id);

alter table public.reports enable row level security;

drop policy if exists "Users can read their own reports" on public.reports;
create policy "Users can read their own reports"
  on public.reports
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own reports" on public.reports;
create policy "Users can create their own reports"
  on public.reports
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.upload_batches
      where upload_batches.id = upload_batch_id
        and upload_batches.user_id = (select auth.uid())
    )
  );

drop policy if exists "Users can update their own reports" on public.reports;
create policy "Users can update their own reports"
  on public.reports
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.upload_batches
      where upload_batches.id = upload_batch_id
        and upload_batches.user_id = (select auth.uid())
    )
  );

drop policy if exists "Users can delete their own reports" on public.reports;
create policy "Users can delete their own reports"
  on public.reports
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

drop trigger if exists set_reports_updated_at on public.reports;
create trigger set_reports_updated_at
  before update on public.reports
  for each row
  execute function public.set_updated_at();
