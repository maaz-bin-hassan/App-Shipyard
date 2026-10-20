-- Row level security for profiles and ai_usage.
-- Run with the helper in the same session: npm run test:backend
-- The script rolls back every row it inserts.

begin;

select pg_temp.insert_auth_user('11111111-1111-4111-8111-111111111111', 'a@example.com');
select pg_temp.insert_auth_user('22222222-2222-4222-8222-222222222222', 'b@example.com');

do $$
begin
  if not exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'profiles'
      and c.relrowsecurity
  ) then
    raise exception 'profiles row level security is off';
  end if;

  if not exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'ai_usage'
      and c.relrowsecurity
  ) then
    raise exception 'ai_usage row level security is off';
  end if;

  if (select count(*) from public.profiles) <> 2 then
    raise exception 'signup trigger created % profiles', (select count(*) from public.profiles);
  end if;
end
$$;

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}',
  true
);

do $$
declare
  n int;
  seen_name text;
begin
  if auth.uid() is distinct from '11111111-1111-4111-8111-111111111111'::uuid then
    raise exception 'auth.uid() is % for user A', auth.uid();
  end if;

  if (select count(*) from public.profiles) <> 1 then
    raise exception 'user A sees % profiles', (select count(*) from public.profiles);
  end if;

  if (select id from public.profiles) is distinct from auth.uid() then
    raise exception 'user A can see another profile';
  end if;

  update public.profiles
  set display_name = 'stolen'
  where id = '22222222-2222-4222-8222-222222222222';
  get diagnostics n = row_count;
  if n <> 0 then
    raise exception 'user A updated % profiles owned by user B', n;
  end if;

  update public.profiles
  set display_name = 'Ada'
  where id = auth.uid();
  get diagnostics n = row_count;
  if n <> 1 then
    raise exception 'user A updated % of their own profile', n;
  end if;

  select display_name into seen_name from public.profiles where id = auth.uid();
  if seen_name is distinct from 'Ada' then
    raise exception 'user A read display name %', seen_name;
  end if;

  begin
    update public.profiles
    set id = '22222222-2222-4222-8222-222222222222'
    where id = auth.uid();
    raise exception 'user A changed their profile id';
  exception
    when insufficient_privilege then
      null;
  end;

  delete from public.profiles
  where id = '22222222-2222-4222-8222-222222222222';
  get diagnostics n = row_count;
  if n <> 0 then
    raise exception 'user A deleted % profiles owned by user B', n;
  end if;

  delete from public.profiles where id = auth.uid();
  get diagnostics n = row_count;
  if n <> 1 then
    raise exception 'user A deleted % of their own profile', n;
  end if;

  insert into public.profiles (id, display_name)
  values (auth.uid(), 'Ada');

  begin
    insert into public.profiles (id)
    values ('22222222-2222-4222-8222-222222222222');
    raise exception 'user A inserted a profile for user B';
  exception
    when insufficient_privilege then
      null;
  end;
end
$$;

reset role;

insert into public.ai_usage (user_id, day, request_count)
values
  ('11111111-1111-4111-8111-111111111111', (timezone('utc', now()))::date, 3),
  ('22222222-2222-4222-8222-222222222222', (timezone('utc', now()))::date, 9);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}',
  true
);

do $$
declare
  n int;
begin
  if (select count(*) from public.ai_usage) <> 1 then
    raise exception 'user A sees % ai_usage rows', (select count(*) from public.ai_usage);
  end if;

  if (select request_count from public.ai_usage) <> 3 then
    raise exception 'user A read another user''s request count';
  end if;

  begin
    update public.ai_usage
    set request_count = 0
    where user_id = '22222222-2222-4222-8222-222222222222';
    get diagnostics n = row_count;
    if n <> 0 then
      raise exception 'user A updated % ai_usage rows', n;
    end if;
  exception
    when insufficient_privilege then
      null;
  end;

  begin
    insert into public.ai_usage (user_id, day, request_count)
    values (auth.uid(), (timezone('utc', now()))::date, 1);
    raise exception 'user A inserted an ai_usage row';
  exception
    when insufficient_privilege then
      null;
  end;
end
$$;

reset role;
select set_config('request.jwt.claims', '', true);
set local role anon;

do $$
declare
  n int;
begin
  begin
    select count(*) into n from public.profiles;
    if n <> 0 then
      raise exception 'anon saw % profiles', n;
    end if;
  exception
    when insufficient_privilege then
      null;
  end;

  begin
    select count(*) into n from public.ai_usage;
    if n <> 0 then
      raise exception 'anon saw % ai_usage rows', n;
    end if;
  exception
    when insufficient_privilege then
      null;
  end;

  begin
    insert into public.profiles (id)
    values ('11111111-1111-4111-8111-111111111111');
    raise exception 'anon inserted a profile';
  exception
    when insufficient_privilege then
      null;
  end;
end
$$;

reset role;

do $$
declare
  b_name text;
  b_count int;
begin
  if (select count(*) from public.profiles) <> 2 then
    raise exception 'profile count after the user checks is %', (select count(*) from public.profiles);
  end if;

  select display_name into b_name
  from public.profiles
  where id = '22222222-2222-4222-8222-222222222222';
  if b_name is not null then
    raise exception 'user B display name changed to %', b_name;
  end if;

  select request_count into b_count
  from public.ai_usage
  where user_id = '22222222-2222-4222-8222-222222222222';
  if b_count is distinct from 9 then
    raise exception 'user B request count changed to %', b_count;
  end if;

  if (select display_name from public.profiles where id = '11111111-1111-4111-8111-111111111111')
    is distinct from 'Ada' then
    raise exception 'user A profile was not kept';
  end if;
end
$$;

rollback;
