begin;

select plan(18);

insert into auth.users (id, aud, role, email)
values
  (
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    'authenticated',
    'authenticated',
    'site-content-admin@example.invalid'
  ),
  (
    'ffffffff-ffff-4fff-8fff-ffffffffffff',
    'authenticated',
    'authenticated',
    'site-content-member@example.invalid'
  );

insert into public.admin_roles (user_id)
values ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee');

insert into public.site_content (content_key, content_value)
values ('site_content.public_test', 'Public default override');

select has_table(
  'public',
  'site_content',
  'site content table exists'
);
select ok(
  (
    select relrowsecurity
    from pg_catalog.pg_class
    where oid = 'public.site_content'::regclass
  ),
  'site content has row-level security enabled'
);
select ok(
  has_table_privilege('anon', 'public.site_content', 'SELECT'),
  'anonymous visitors can read public site content'
);
select ok(
  not has_table_privilege('anon', 'public.site_content', 'INSERT'),
  'anonymous visitors cannot insert site content'
);
select ok(
  not has_table_privilege('anon', 'public.site_content', 'UPDATE'),
  'anonymous visitors cannot update site content'
);
select ok(
  not has_table_privilege('anon', 'public.site_content', 'DELETE'),
  'anonymous visitors cannot delete site content'
);
select ok(
  has_table_privilege('authenticated', 'public.site_content', 'SELECT'),
  'authenticated users can read public site content'
);
select ok(
  has_table_privilege('authenticated', 'public.site_content', 'INSERT'),
  'authenticated users have insert privilege subject to RLS'
);
select ok(
  has_table_privilege('authenticated', 'public.site_content', 'UPDATE'),
  'authenticated users have update privilege subject to RLS'
);
select ok(
  has_table_privilege('authenticated', 'public.site_content', 'DELETE'),
  'authenticated users have delete privilege subject to RLS'
);

set local role anon;
select is(
  (select count(*)::integer from public.site_content),
  1,
  'anonymous visitors can read saved public copy'
);
reset role;

select set_config(
  'request.jwt.claim.sub',
  'ffffffff-ffff-4fff-8fff-ffffffffffff',
  true
);
select set_config(
  'request.jwt.claims',
  '{"sub":"ffffffff-ffff-4fff-8fff-ffffffffffff","role":"authenticated"}',
  true
);
set local role authenticated;
select is(
  (
    with updated as (
      update public.site_content
      set content_value = 'Unauthorized edit'
      where content_key = 'site_content.public_test'
      returning 1
    )
    select count(*)::integer from updated
  ),
  0,
  'authenticated non-admin cannot update public copy'
);
select is(
  (
    with deleted as (
      delete from public.site_content
      where content_key = 'site_content.public_test'
      returning 1
    )
    select count(*)::integer from deleted
  ),
  0,
  'authenticated non-admin cannot delete public copy'
);
select throws_ok(
  $query$
    insert into public.site_content (content_key, content_value)
    values ('site_content.unauthorized_test', 'Unauthorized edit')
  $query$,
  '42501',
  'new row violates row-level security policy for table "site_content"',
  'authenticated non-admin cannot insert public copy'
);
reset role;

select set_config(
  'request.jwt.claim.sub',
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
  true
);
select set_config(
  'request.jwt.claims',
  '{"sub":"eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee","role":"authenticated"}',
  true
);
set local role authenticated;
select lives_ok(
  $query$
    insert into public.site_content (content_key, content_value)
    values ('site_content.admin_test', 'Admin copy')
  $query$,
  'admin can insert public copy'
);
select lives_ok(
  $query$
    update public.site_content
    set content_value = 'Updated admin copy'
    where content_key = 'site_content.admin_test'
  $query$,
  'admin can update public copy'
);
select is(
  (
    select content_value
    from public.site_content
    where content_key = 'site_content.admin_test'
  ),
  'Updated admin copy',
  'admin update is stored'
);
select lives_ok(
  $query$
    delete from public.site_content
    where content_key = 'site_content.admin_test'
  $query$,
  'admin can delete public copy'
);

reset role;
select * from finish();
rollback;
