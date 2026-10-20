-- Atomic daily limit. Run with the helper in the same session: npm run test:backend
-- The script rolls back every row it inserts.

begin;

select pg_temp.insert_auth_user('11111111-1111-4111-8111-111111111111', 'a@example.com');
select pg_temp.insert_auth_user('22222222-2222-4222-8222-222222222222', 'b@example.com');
select pg_temp.insert_auth_user('33333333-3333-4333-8333-333333333333', 'c@example.com');

do $$
declare
  v integer;
  stored integer;
begin
  v := public.increment_ai_usage('11111111-1111-4111-8111-111111111111', 2);
  if v is distinct from 1 then
    raise exception 'first increment returned %', v;
  end if;

  v := public.increment_ai_usage('11111111-1111-4111-8111-111111111111', 2);
  if v is distinct from 2 then
    raise exception 'second increment returned %', v;
  end if;

  v := public.increment_ai_usage('11111111-1111-4111-8111-111111111111', 2);
  if v is not null then
    raise exception 'increment past the limit returned %', v;
  end if;

  select request_count into stored
  from public.ai_usage
  where user_id = '11111111-1111-4111-8111-111111111111'
    and day = (timezone('utc', now()))::date;
  if stored is distinct from 2 then
    raise exception 'stored count after the limit is %', stored;
  end if;

  v := public.increment_ai_usage('22222222-2222-4222-8222-222222222222', 2);
  if v is distinct from 1 then
    raise exception 'second user increment returned %', v;
  end if;

  if (
    select request_count
    from public.ai_usage
    where user_id = '11111111-1111-4111-8111-111111111111'
      and day = (timezone('utc', now()))::date
  ) is distinct from 2 then
    raise exception 'second user changed the first user count';
  end if;
end
$$;

insert into public.ai_usage (user_id, day, request_count)
values ('22222222-2222-4222-8222-222222222222', (timezone('utc', now()))::date, 4)
on conflict (user_id, day)
do update set request_count = excluded.request_count;

do $$
declare
  v integer;
  stored integer;
begin
  v := public.increment_ai_usage('22222222-2222-4222-8222-222222222222', 4);
  if v is not null then
    raise exception 'increment at an existing limit returned %', v;
  end if;

  select request_count into stored
  from public.ai_usage
  where user_id = '22222222-2222-4222-8222-222222222222'
    and day = (timezone('utc', now()))::date;
  if stored is distinct from 4 then
    raise exception 'existing limit row changed to %', stored;
  end if;
end
$$;

insert into public.ai_usage (user_id, day, request_count)
values (
  '33333333-3333-4333-8333-333333333333',
  (timezone('utc', now()))::date - 1,
  50
);

do $$
declare
  v integer;
  yesterday integer;
begin
  v := public.increment_ai_usage('33333333-3333-4333-8333-333333333333', 10);
  if v is distinct from 1 then
    raise exception 'new UTC day increment returned %', v;
  end if;

  select request_count into yesterday
  from public.ai_usage
  where user_id = '33333333-3333-4333-8333-333333333333'
    and day = (timezone('utc', now()))::date - 1;
  if yesterday is distinct from 50 then
    raise exception 'yesterday count changed to %', yesterday;
  end if;
end
$$;

do $$
begin
  begin
    perform public.increment_ai_usage('11111111-1111-4111-8111-111111111111', 0);
    raise exception 'limit 0 was accepted';
  exception
    when invalid_parameter_value then
      null;
  end;

  begin
    perform public.increment_ai_usage(null, 10);
    raise exception 'null user id was accepted';
  exception
    when invalid_parameter_value then
      null;
  end;
end
$$;

do $$
begin
  begin
    execute 'set local role authenticated';
    perform set_config(
      'request.jwt.claims',
      '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}',
      true
    );
    perform public.increment_ai_usage('11111111-1111-4111-8111-111111111111', 10);
    raise exception 'authenticated called increment_ai_usage';
  exception
    when insufficient_privilege then
      if sqlerrm not ilike '%increment_ai_usage%' then
        raise;
      end if;
  end;
  execute 'reset role';
end
$$;

grant execute on function public.increment_ai_usage(uuid, integer) to authenticated;

do $$
declare
  before_count integer;
  after_count integer;
begin
  select request_count into before_count
  from public.ai_usage
  where user_id = '22222222-2222-4222-8222-222222222222'
    and day = (timezone('utc', now()))::date;

  execute 'set local role authenticated';
  perform set_config(
    'request.jwt.claims',
    '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}',
    true
  );

  begin
    perform public.increment_ai_usage('22222222-2222-4222-8222-222222222222', 10);
    raise exception 'cross-user increment succeeded';
  exception
    when insufficient_privilege then
      if sqlerrm not ilike '%another user%' then
        raise;
      end if;
  end;

  execute 'reset role';

  select request_count into after_count
  from public.ai_usage
  where user_id = '22222222-2222-4222-8222-222222222222'
    and day = (timezone('utc', now()))::date;
  if after_count is distinct from before_count then
    raise exception 'cross-user attempt changed the count from % to %', before_count, after_count;
  end if;
end
$$;

rollback;
