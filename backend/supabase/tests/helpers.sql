-- Prepended inside the test transaction by backend/supabase/tests/database.test.ts.
-- Not a migration. Do not apply this file to a Supabase project.

create or replace function pg_temp.insert_auth_user(p_id uuid, p_email text)
returns void
language plpgsql
as $$
declare
  col record;
  names text[] := array[]::text[];
  values_sql text[] := array[]::text[];
  expr text;
begin
  for col in
    select column_name, data_type, udt_name, is_nullable, column_default, is_generated, is_identity
    from information_schema.columns
    where table_schema = 'auth'
      and table_name = 'users'
      and is_generated = 'NEVER'
      and coalesce(is_identity, 'NO') = 'NO'
  loop
    expr := null;
    if col.column_name = 'id' then
      expr := quote_literal(p_id);
    elsif col.column_name = 'email' then
      expr := quote_literal(p_email);
    elsif col.column_name in ('aud', 'role') then
      expr := quote_literal('authenticated');
    elsif col.column_name = 'instance_id' then
      expr := quote_literal('00000000-0000-0000-0000-000000000000');
    elsif col.is_nullable = 'NO' and col.column_default is null then
      if col.data_type = 'uuid' then
        expr := quote_literal('00000000-0000-0000-0000-000000000000');
      elsif col.data_type in ('character varying', 'text', 'character') then
        expr := quote_literal('');
      elsif col.data_type = 'boolean' then
        expr := 'false';
      elsif col.data_type in ('timestamp with time zone', 'timestamp without time zone', 'date') then
        expr := 'now()';
      elsif col.udt_name = 'jsonb' then
        expr := '''{}''::jsonb';
      elsif col.udt_name = 'json' then
        expr := '''{}''::json';
      elsif col.data_type in ('smallint', 'integer', 'bigint') then
        expr := '0';
      else
        raise exception 'auth.users column % has type % and needs a test value', col.column_name, col.data_type;
      end if;
    end if;

    if expr is not null then
      names := names || quote_ident(col.column_name);
      values_sql := values_sql || expr;
    end if;
  end loop;

  if array_length(names, 1) is null then
    raise exception 'auth.users has no insertable columns';
  end if;

  execute format(
    'insert into auth.users (%s) values (%s)',
    array_to_string(names, ', '),
    array_to_string(values_sql, ', ')
  );
end;
$$;

revoke all on function pg_temp.insert_auth_user(uuid, text) from public;
