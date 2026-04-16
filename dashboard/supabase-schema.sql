-- ============================================================
-- Fillr — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ─── 1. Answers table ──────────────────────────────────────

create table if not exists public.answers (
  id             uuid primary key default gen_random_uuid(),
  user_id        text not null,
  question_hash  text not null,
  question_text  text not null,
  answer         text not null,
  used_count     integer not null default 1,
  page_url       text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ─── 2. Resumes table ──────────────────────────────────────

create table if not exists public.resumes (
  id             uuid primary key default gen_random_uuid(),
  user_id        text not null,
  file_name      text,
  version        integer not null default 1,
  raw_text       text,
  chunks         jsonb,
  storage_path   text,
  size_kb        integer,
  created_at     timestamptz not null default now()
);

-- ─── 3. Enable RLS ─────────────────────────────────────────

alter table public.answers enable row level security;
alter table public.resumes enable row level security;

-- ─── 4. RLS policies (answers) ─────────────────────────────

drop policy if exists "Users can select own answers" on public.answers;
create policy "Users can select own answers"
on public.answers for select
using ( user_id = (auth.jwt() ->> 'sub') );

drop policy if exists "Users can insert own answers" on public.answers;
create policy "Users can insert own answers"
on public.answers for insert
with check ( user_id = (auth.jwt() ->> 'sub') );

drop policy if exists "Users can update own answers" on public.answers;
create policy "Users can update own answers"
on public.answers for update
using ( user_id = (auth.jwt() ->> 'sub') );

drop policy if exists "Users can delete own answers" on public.answers;
create policy "Users can delete own answers"
on public.answers for delete
using ( user_id = (auth.jwt() ->> 'sub') );

-- ─── 4b. RLS policies (resumes) ───────────────────────────

drop policy if exists "Users can select own resumes" on public.resumes;
create policy "Users can select own resumes"
on public.resumes for select
using ( user_id = (auth.jwt() ->> 'sub') );

drop policy if exists "Users can insert own resumes" on public.resumes;
create policy "Users can insert own resumes"
on public.resumes for insert
with check ( user_id = (auth.jwt() ->> 'sub') );

drop policy if exists "Users can update own resumes" on public.resumes;
create policy "Users can update own resumes"
on public.resumes for update
using ( user_id = (auth.jwt() ->> 'sub') );

drop policy if exists "Users can delete own resumes" on public.resumes;
create policy "Users can delete own resumes"
on public.resumes for delete
using ( user_id = (auth.jwt() ->> 'sub') );

-- ─── 5. Index for fast lookups ─────────────────────────────

create index if not exists idx_answers_user_question
on public.answers (user_id, question_hash);

-- ─── 6. Auto-update updated_at trigger ─────────────────────

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_answers_updated_at on public.answers;
create trigger set_answers_updated_at
  before update on public.answers
  for each row
  execute function public.handle_updated_at();

-- ─── 7. Storage bucket for resumes ─────────────────────────

insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict do nothing;

-- ─── 8. Storage RLS policy ─────────────────────────────────

drop policy if exists "Users access own resume files" on storage.objects;
create policy "Users access own resume files"
on storage.objects for all
using (
  bucket_id = 'resumes' and
  (storage.foldername(name))[1] = (auth.jwt() ->> 'sub')
);

-- ─── 9. Applications table ─────────────────────────────────

create table if not exists public.applications (
  id             uuid primary key default gen_random_uuid(),
  user_id        text not null,
  company_name   text,
  role_title     text,
  platform       text,
  created_at     timestamptz not null default now()
);

alter table public.applications enable row level security;

drop policy if exists "Users can access own applications" on public.applications;
create policy "Users can access own applications"
on public.applications for all
using ( user_id = (auth.jwt() ->> 'sub') );

create index if not exists idx_applications_user
on public.applications (user_id);