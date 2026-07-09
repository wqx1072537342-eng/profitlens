alter table public.download_events
  drop constraint if exists download_events_file_type_check;

alter table public.download_events
  add constraint download_events_file_type_check
  check (file_type in ('excel_csv', 'xlsx'));
