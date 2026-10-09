-- Life RPG cloud saves (additive)
-- Prerequisite: Career Switch OS simple_auth.sql already ran in this Supabase project
--   (app_accounts / app_sessions / app_register / app_login already exist).
-- This file only adds a SEPARATE save table so Life RPG never overwrites NeetCode progress.
-- Run once in Supabase → SQL Editor.

create table if not exists public.life_rpg_saves (
  account_id uuid primary key references public.app_accounts (id) on delete cascade,
  schema_version int not null default 1,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.life_rpg_saves enable row level security;
revoke all on public.life_rpg_saves from anon, authenticated;

create or replace function public.life_rpg_fetch(p_token text)
returns table (schema_version int, payload jsonb, updated_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account uuid;
begin
  select s.account_id into v_account from public.app_sessions s where s.token = p_token;
  if v_account is null then
    raise exception 'Not signed in';
  end if;

  update public.app_sessions set last_seen_at = now() where token = p_token;

  return query
    select j.schema_version, j.payload, j.updated_at
    from public.life_rpg_saves j
    where j.account_id = v_account;
end;
$$;

create or replace function public.life_rpg_upsert(
  p_token text,
  p_schema int,
  p_payload jsonb,
  p_updated timestamptz
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account uuid;
begin
  select s.account_id into v_account from public.app_sessions s where s.token = p_token;
  if v_account is null then
    raise exception 'Not signed in';
  end if;

  update public.app_sessions set last_seen_at = now() where token = p_token;

  insert into public.life_rpg_saves (account_id, schema_version, payload, updated_at)
  values (v_account, p_schema, p_payload, coalesce(p_updated, now()))
  on conflict (account_id) do update
    set
      schema_version = excluded.schema_version,
      payload = excluded.payload,
      updated_at = excluded.updated_at
    where excluded.updated_at >= life_rpg_saves.updated_at;
end;
$$;

grant execute on function public.life_rpg_fetch(text) to anon, authenticated;
grant execute on function public.life_rpg_upsert(text, int, jsonb, timestamptz) to anon, authenticated;
