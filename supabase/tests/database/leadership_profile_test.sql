begin;

select plan(11);

insert into auth.users (id, aud, role, email)
values
  (
    'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    'authenticated',
    'authenticated',
    'leadership-admin@example.invalid'
  ),
  (
    'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    'authenticated',
    'authenticated',
    'leadership-member@example.invalid'
  );

insert into public.admin_roles (user_id)
values ('cccccccc-cccc-4ccc-8ccc-cccccccccccc');

select has_table(
  'public',
  'leadership_profile',
  'leadership profile table exists'
);
select ok(
  (
    select relrowsecurity
    from pg_catalog.pg_class
    where oid = 'public.leadership_profile'::regclass
  ),
  'leadership profile has row-level security enabled'
);
select ok(
  has_table_privilege('anon', 'public.leadership_profile', 'SELECT'),
  'anonymous users can read the public leadership profile'
);
select ok(
  not has_table_privilege('anon', 'public.leadership_profile', 'UPDATE'),
  'anonymous users cannot update the leadership profile'
);
select ok(
  has_table_privilege('authenticated', 'public.leadership_profile', 'UPDATE'),
  'authenticated admins have update privilege subject to RLS'
);
select is(
  (select full_name from public.leadership_profile where profile_key = 'ceo'),
  'Evans',
  'migration seeds the confirmed CEO name'
);
select is(
  (select email from public.leadership_profile where profile_key = 'ceo'),
  'evans@rhemarealestates.com',
  'migration seeds the supplied CEO email'
);

set local role anon;
select is(
  (select count(*)::integer from public.leadership_profile),
  1,
  'anonymous users see the CEO profile'
);
reset role;

select set_config(
  'request.jwt.claim.sub',
  'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  true
);
select set_config(
  'request.jwt.claims',
  '{"sub":"dddddddd-dddd-4ddd-8ddd-dddddddddddd","role":"authenticated"}',
  true
);
set local role authenticated;
select is(
  (
    with updated as (
      update public.leadership_profile
      set full_name = 'Unauthorized edit'
      where profile_key = 'ceo'
      returning 1
    )
    select count(*)::integer from updated
  ),
  0,
  'authenticated non-admin cannot update the CEO profile'
);
reset role;

select set_config(
  'request.jwt.claim.sub',
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  true
);
select set_config(
  'request.jwt.claims',
  '{"sub":"cccccccc-cccc-4ccc-8ccc-cccccccccccc","role":"authenticated"}',
  true
);
set local role authenticated;
select lives_ok(
  $query$
    update public.leadership_profile
    set full_name = 'Updated CEO'
    where profile_key = 'ceo'
  $query$,
  'admin can update the CEO profile'
);
select is(
  (select full_name from public.leadership_profile where profile_key = 'ceo'),
  'Updated CEO',
  'admin update is stored'
);

reset role;
select * from finish();
rollback;
