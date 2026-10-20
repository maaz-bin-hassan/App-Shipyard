-- Per-user daily request counts. Clients may read their own row.
-- Only increment_ai_usage writes, and only service_role may call it.

create table public.ai_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  request_count integer not null default 0,
  primary key (user_id, day),
  constraint ai_usage_request_count_nonnegative check (request_count >= 0)
);

comment on table public.ai_usage is
  'Per-user daily AI request counts. Clients read their own row. Writes go through increment_ai_usage.';

alter table public.ai_usage enable row level security;

create policy ai_usage_select_own
  on public.ai_usage
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Returns the new count when today's UTC count was below p_limit.
-- Returns null, and does not change the row, when the limit is already reached.
-- A single INSERT .. ON CONFLICT locks the day's row, so concurrent calls cannot both pass the limit.
create or replace function public.increment_ai_usage(p_user_id uuid, p_limit integer)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_day date := (timezone('utc', now()))::date;
  v_count integer;
begin
  if p_user_id is null then
    raise exception 'user id is required' using errcode = '22023';
  end if;

  if p_limit is null or p_limit < 1 or p_limit > 1000000 then
    raise exception 'limit must be a positive integer' using errcode = '22023';
  end if;

  -- service_role calls have no user id. A signed-in caller may only touch their own row.
  if auth.uid() is not null and auth.uid() is distinct from p_user_id then
    raise exception 'cannot increment usage for another user' using errcode = '42501';
  end if;

  insert into public.ai_usage as usage (user_id, day, request_count)
  values (p_user_id, v_day, 1)
  on conflict (user_id, day)
  do update
    set request_count = usage.request_count + 1
  where usage.request_count < p_limit
  returning usage.request_count into v_count;

  return v_count;
end;
$$;

comment on function public.increment_ai_usage(uuid, integer) is
  'Atomically increments today''s UTC request count when it is below p_limit. Returns the new count, or null when the limit is already reached.';

revoke all on function public.increment_ai_usage(uuid, integer) from public, anon, authenticated;
grant execute on function public.increment_ai_usage(uuid, integer) to service_role;

revoke all on table public.ai_usage from anon, authenticated;
grant select on table public.ai_usage to authenticated;
grant select, insert, update, delete on table public.ai_usage to service_role;
