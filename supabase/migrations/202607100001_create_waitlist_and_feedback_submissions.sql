create extension if not exists pgcrypto;

create table if not exists public.waitlist_submissions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  interest text not null,
  source_page text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists waitlist_submissions_created_at_idx
  on public.waitlist_submissions (created_at desc);

create index if not exists waitlist_submissions_interest_idx
  on public.waitlist_submissions (interest);

alter table public.waitlist_submissions enable row level security;

grant insert on public.waitlist_submissions to anon, authenticated;

drop policy if exists "Anyone can submit waitlist interest" on public.waitlist_submissions;
create policy "Anyone can submit waitlist interest"
  on public.waitlist_submissions
  for insert
  to anon, authenticated
  with check (
    length(trim(email)) > 0
    and length(trim(interest)) > 0
    and length(trim(source_page)) > 0
  );

create table if not exists public.feedback_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references public.users(id) on delete set null,
  email text null,
  topic text not null,
  message text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists feedback_submissions_created_at_idx
  on public.feedback_submissions (created_at desc);

create index if not exists feedback_submissions_user_id_idx
  on public.feedback_submissions (user_id);

alter table public.feedback_submissions enable row level security;

grant insert on public.feedback_submissions to anon, authenticated;

drop policy if exists "Anyone can submit feedback" on public.feedback_submissions;
create policy "Anyone can submit feedback"
  on public.feedback_submissions
  for insert
  to anon, authenticated
  with check (
    length(trim(topic)) > 0
    and length(trim(message)) > 0
    and (
      user_id is null
      or user_id = (select auth.uid())
    )
  );
