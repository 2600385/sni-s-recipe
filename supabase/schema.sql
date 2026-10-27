-- 스니의 업무 레시피 · 창고 구조 (계정·비밀번호·첫 자료는 별도 설치 파일에서 넣는다)
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users(id) on delete cascade,
  section text not null check (section in ('tool', 'note')),
  title text not null check (length(title) between 1 and 200),
  kind text not null,
  url text,
  file_path text,
  body text,
  descr text,
  pockets text[] not null default '{}',
  mine boolean not null default false,
  tab text,
  sub text,
  doc_date text,
  secret boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists items_owner_idx on public.items (owner, created_at desc);
alter table public.items enable row level security;

-- 시크릿 서랍 비밀번호 (해시만 저장, 정책 없음 = 직접 읽기 불가)
create table if not exists public.secret_config (
  owner uuid primary key references auth.users(id) on delete cascade,
  pw_hash text not null
);
alter table public.secret_config enable row level security;

-- 요청 헤더 x-secret-pw 가 서랍 비밀번호와 맞는지
create or replace function public.secret_ok()
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  raw text := coalesce((current_setting('request.headers', true))::json ->> 'x-secret-pw', '');
  pw text;
  h text;
begin
  if raw = '' then return false; end if;
  -- 화면은 한글 비밀번호를 base64로 보낸다
  begin
    pw := convert_from(decode(raw, 'base64'), 'UTF8');
  exception when others then
    return false;
  end;
  select c.pw_hash into h from public.secret_config c where c.owner = auth.uid();
  return h is not null and extensions.crypt(pw, h) = h;
end;
$$;
revoke all on function public.secret_ok() from public, anon;
grant execute on function public.secret_ok() to authenticated;

-- 시크릿 행은 서랍 비밀번호가 확인된 요청에서만 보이고 고칠 수 있다
drop policy if exists items_select on public.items;
drop policy if exists items_insert on public.items;
drop policy if exists items_update on public.items;
drop policy if exists items_delete on public.items;
create policy items_select on public.items for select to authenticated
  using (owner = (select auth.uid()) and (secret = false or (select public.secret_ok())));
create policy items_insert on public.items for insert to authenticated
  with check (owner = (select auth.uid()) and (secret = false or (select public.secret_ok())));
create policy items_update on public.items for update to authenticated
  using (owner = (select auth.uid())) with check (owner = (select auth.uid()));
create policy items_delete on public.items for delete to authenticated
  using (owner = (select auth.uid()));

-- 서랍 열기: 비밀번호가 틀리면 오류
create or replace function public.get_secret_items(pw text)
returns setof public.items
language plpgsql
security definer
set search_path = ''
as $$
declare
  h text;
begin
  select c.pw_hash into h from public.secret_config c where c.owner = auth.uid();
  if h is null or extensions.crypt(pw, h) <> h then
    raise exception 'wrong_secret_password' using errcode = '28P01';
  end if;
  return query select * from public.items i where i.owner = auth.uid() and i.secret = true order by i.created_at desc;
end;
$$;
revoke all on function public.get_secret_items(text) from public, anon;
grant execute on function public.get_secret_items(text) to authenticated;

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end; $$;
drop trigger if exists items_touch on public.items;
create trigger items_touch before update on public.items for each row execute function public.touch_updated_at();

-- 파일 보관함 (비공개, 본인 폴더만)
insert into storage.buckets (id, name, public, file_size_limit)
values ('files', 'files', false, 52428800)
on conflict (id) do nothing;

drop policy if exists files_select on storage.objects;
drop policy if exists files_insert on storage.objects;
drop policy if exists files_delete on storage.objects;
create policy files_select on storage.objects for select to authenticated
  using (bucket_id = 'files' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy files_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'files' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy files_delete on storage.objects for delete to authenticated
  using (bucket_id = 'files' and (storage.foldername(name))[1] = (select auth.uid())::text);
