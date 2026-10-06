create extension if not exists "uuid-ossp";

create table if not exists public.documents (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  file_path text not null unique,
  file_size bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.reading_progress (
  document_id uuid references public.documents(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  page integer not null default 1 check (page > 0),
  updated_at timestamptz not null default now(),
  primary key (document_id, user_id)
);
create table if not exists public.bookmarks (
  id uuid primary key default uuid_generate_v4(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  page integer not null check (page > 0),
  note text,
  created_at timestamptz not null default now(),
  unique(document_id, user_id, page)
);

alter table public.documents enable row level security;
alter table public.reading_progress enable row level security;
alter table public.bookmarks enable row level security;
create policy "Users manage their documents" on public.documents for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "Users manage their progress" on public.reading_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage their bookmarks" on public.bookmarks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Create a private bucket named pdfs in the Supabase dashboard, then add:
-- insert into storage.buckets (id, name, public)
-- values ('pdfs', 'pdfs', false)
-- on conflict (id) do update set public = false;
--
-- Files must be stored under: <user-id>/<file-name>.pdf
create policy "PDF owners can read their files"
on storage.objects for select
to authenticated
using (
  bucket_id = 'pdfs'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "PDF owners can upload files"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'pdfs'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "PDF owners can update their files"
on storage.objects for update
to authenticated
using (
  bucket_id = 'pdfs'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
  bucket_id = 'pdfs'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "PDF owners can delete their files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'pdfs'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);
