create extension if not exists pgcrypto;

create table if not exists public.download_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  report_id uuid not null references public.reports(id) on delete cascade,
  file_type text not null
    check (file_type in ('excel_csv')),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists download_events_user_id_idx
  on public.download_events (user_id);

create index if not exists download_events_report_id_idx
  on public.download_events (report_id);

alter table public.download_events enable row level security;

drop policy if exists "Users can read their own download events" on public.download_events;
create policy "Users can read their own download events"
  on public.download_events
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create download events for their own reports" on public.download_events;
create policy "Users can create download events for their own reports"
  on public.download_events
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.reports
      where reports.id = report_id
        and reports.user_id = (select auth.uid())
    )
  );
