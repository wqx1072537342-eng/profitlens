alter table public.uploads
  add column if not exists rows_json jsonb not null default '[]'::jsonb;

alter table public.reports
  add column if not exists completeness_status text not null default 'limited'
    check (completeness_status in ('complete', 'partial', 'limited')),
  add column if not exists included_file_types_json jsonb not null default '[]'::jsonb,
  add column if not exists missing_file_types_json jsonb not null default '[]'::jsonb;
