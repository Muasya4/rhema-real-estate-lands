begin;

select plan(58);

insert into auth.users (id, aud, role, email)
values
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'authenticated',
    'authenticated',
    'phase03-admin@example.invalid'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'authenticated',
    'authenticated',
    'phase03-member@example.invalid'
  );

insert into public.admin_roles (user_id)
values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');

insert into public.properties (
  id,
  title,
  slug,
  description,
  location,
  region,
  status,
  is_published,
  updated_at
)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'Published property fixture',
    'published-property-fixture',
    'Synthetic data used only by the database test.',
    'Ruiru',
    'ruiru',
    null,
    true,
    '2000-01-01 00:00:00+00'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'Draft property fixture',
    'draft-property-fixture',
    'Synthetic data used only by the database test.',
    'Kamakis',
    'kamakis',
    'reserved',
    false,
    '2000-01-01 00:00:00+00'
  );

insert into public.blog_posts (
  id,
  title,
  slug,
  excerpt,
  content,
  published_at
)
values
  (
    '33333333-3333-4333-8333-333333333333',
    'Published article fixture',
    'published-article-fixture',
    'Synthetic data used only by the database test.',
    'Synthetic data used only by the database test.',
    now() - interval '1 day'
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    'Draft article fixture',
    'draft-article-fixture',
    'Synthetic data used only by the database test.',
    'Synthetic data used only by the database test.',
    null
  ),
  (
    '55555555-5555-4555-8555-555555555555',
    'Scheduled article fixture',
    'scheduled-article-fixture',
    'Synthetic data used only by the database test.',
    'Synthetic data used only by the database test.',
    now() + interval '1 day'
  );

insert into public.inquiries (
  id,
  name,
  email,
  phone,
  message,
  property_id
)
values (
  '66666666-6666-4666-8666-666666666666',
  'Test Contact',
  'phase03-inquiry@example.invalid',
  '0000000000',
  'Synthetic data used only by the database test.',
  '11111111-1111-4111-8111-111111111111'
);

select has_table('public', 'properties', 'properties table exists');
select has_table('public', 'inquiries', 'inquiries table exists');
select has_table('public', 'blog_posts', 'blog posts table exists');
select has_table('public', 'admin_roles', 'admin roles table exists');
select has_table('public', 'regions', 'regions table exists');
select is(
  (
    select count(*)::integer
    from public.regions
  ),
  11,
  'regions table preserves the 11 supplied service areas'
);
select is(
  (
    select data_type::text
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'properties'
      and column_name = 'region'
  ),
  'text',
  'property region references a managed region slug'
);
select ok(
  app_private.is_valid_property_images(
    '[{"path":"properties/example/plot.jpg","alt":"Test plot image"}]'::jsonb
  ),
  'property image records accept a path and alt string'
);
select ok(
  not app_private.is_valid_property_images('[{"path":"properties/plot.jpg"}]'::jsonb),
  'property image records require both path and alt'
);
select ok(
  not app_private.is_valid_property_images(
    '[{"path":"https://example.invalid/plot.jpg","alt":"Test plot image"}]'::jsonb
  ),
  'property image paths are relative Storage object paths'
);
select ok(
  (select relrowsecurity from pg_catalog.pg_class where oid = 'public.properties'::regclass),
  'properties has row-level security enabled'
);
select ok(
  (select relrowsecurity from pg_catalog.pg_class where oid = 'public.inquiries'::regclass),
  'inquiries has row-level security enabled'
);
select ok(
  (select relrowsecurity from pg_catalog.pg_class where oid = 'public.blog_posts'::regclass),
  'blog posts has row-level security enabled'
);
select ok(
  (select relrowsecurity from pg_catalog.pg_class where oid = 'public.admin_roles'::regclass),
  'admin roles has row-level security enabled'
);
select ok(
  (select relrowsecurity from pg_catalog.pg_class where oid = 'public.regions'::regclass),
  'regions has row-level security enabled'
);
select ok(
  has_table_privilege('anon', 'public.properties', 'SELECT'),
  'anonymous users have property read privilege'
);
select ok(
  has_table_privilege('anon', 'public.blog_posts', 'SELECT'),
  'anonymous users have blog post read privilege'
);
select ok(
  has_table_privilege('anon', 'public.regions', 'SELECT'),
  'anonymous users can read regions'
);
select ok(
  not has_table_privilege('anon', 'public.regions', 'INSERT'),
  'anonymous users cannot create regions'
);
select ok(
  not has_table_privilege('anon', 'public.inquiries', 'SELECT'),
  'anonymous users cannot read inquiries'
);
select ok(
  not has_table_privilege('anon', 'public.inquiries', 'INSERT'),
  'anonymous inquiry inserts are disabled pending Phase 07 abuse controls'
);
select ok(
  not has_table_privilege('anon', 'public.admin_roles', 'INSERT'),
  'anonymous users cannot grant admin roles'
);
select ok(
  not has_table_privilege('authenticated', 'public.admin_roles', 'INSERT'),
  'authenticated users cannot grant themselves admin roles'
);
select ok(
  exists (
    select 1
    from pg_catalog.pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'property_images_admin_select'
  ),
  'property image bucket has an admin select policy for upsert'
);
select ok(
  exists (
    select 1
    from pg_catalog.pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'property_images_admin_insert'
  ),
  'property image bucket has an admin insert policy'
);
select ok(
  exists (
    select 1
    from pg_catalog.pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'property_images_admin_update'
  ),
  'property image bucket has an admin update policy'
);
select ok(
  exists (
    select 1
    from pg_catalog.pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'property_images_admin_delete'
  ),
  'property image bucket has an admin delete policy'
);
select is(
  (select public from storage.buckets where id = 'property-images'),
  true,
  'property image bucket is public-read'
);

set local role anon;

select is(
  (select count(*)::integer from public.properties),
  1,
  'anonymous users see published properties only'
);
select is(
  (select count(*)::integer from public.blog_posts),
  1,
  'anonymous users see published, non-scheduled articles only'
);
select is(
  (select count(*)::integer from public.regions),
  11,
  'anonymous users can read all service regions'
);

reset role;
select set_config(
  'request.jwt.claim.sub',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  true
);
select set_config(
  'request.jwt.claims',
  '{"sub":"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb","role":"authenticated"}',
  true
);
set local role authenticated;

select is(
  (select count(*)::integer from public.properties),
  1,
  'non-admin users see published properties only'
);
select is(
  (select count(*)::integer from public.blog_posts),
  1,
  'non-admin users see published articles only'
);
select is(
  (select count(*)::integer from public.regions),
  11,
  'non-admin users can read regions'
);
select is(
  (select count(*)::integer from public.inquiries),
  0,
  'non-admin users cannot read inquiries'
);
select is(
  (select count(*)::integer from public.admin_roles),
  0,
  'non-admin users cannot see another user admin role'
);
select throws_ok(
  $query$
    insert into public.properties (
      title, slug, description, location, region
    )
    values (
      'Unauthorized fixture', 'unauthorized-fixture',
      'Not allowed', 'Ruiru', 'ruiru'
    )
  $query$,
  '42501',
  'new row violates row-level security policy for table "properties"',
  'non-admin users cannot insert properties'
);
select throws_ok(
  $query$
    insert into public.regions (slug, name, display_order)
    values ('unauthorized-region', 'Unauthorized region', 20)
  $query$,
  '42501',
  'new row violates row-level security policy for table "regions"',
  'non-admin users cannot create regions'
);
select throws_ok(
  $query$
    insert into public.inquiries (name, email, phone, message)
    values ('Unauthorized', 'unauthorized@example.invalid', '0000000000', 'Not allowed')
  $query$,
  '42501',
  'new row violates row-level security policy for table "inquiries"',
  'non-admin users cannot insert inquiries'
);

reset role;
select set_config(
  'request.jwt.claim.sub',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  true
);
select set_config(
  'request.jwt.claims',
  '{"sub":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa","role":"authenticated"}',
  true
);
set local role authenticated;

select is(
  (select count(*)::integer from public.properties),
  2,
  'admins can read published properties and drafts'
);
select is(
  (select count(*)::integer from public.blog_posts),
  3,
  'admins can read published, draft, and scheduled articles'
);
select is(
  (select count(*)::integer from public.regions),
  11,
  'admins can read all service regions'
);
select is(
  (select count(*)::integer from public.inquiries),
  1,
  'admins can read inquiries'
);
select is(
  (select count(*)::integer from public.admin_roles),
  1,
  'admins can read their own admin role'
);
select is(
  (select status is null from public.properties where id = '11111111-1111-4111-8111-111111111111'),
  true,
  'missing property status remains NULL rather than implying availability'
);
select lives_ok(
  $query$
    insert into public.properties (
      title, slug, description, location, region
    )
    values (
      'Admin draft fixture', 'admin-draft-fixture',
      'Synthetic data used only by the database test.', 'Kagio', 'kagio'
    )
  $query$,
  'admins can create unpublished properties'
);
select lives_ok(
  $query$
    insert into public.regions (slug, name, display_order)
    values ('admin-added-region', 'Admin added region', 11)
  $query$,
  'admins can create regions'
);
select lives_ok(
  $query$
    update public.regions
    set name = 'Renamed region'
    where slug = 'admin-added-region'
  $query$,
  'admins can rename regions without changing their stable slug'
);
select throws_ok(
  $$delete from public.regions where slug = 'ruiru'$$,
  '23503',
  null,
  'regions used by properties cannot be deleted'
);
select lives_ok(
  $query$
    insert into public.regions (slug, name, display_order)
    values ('unused-region', 'Unused region', 12)
  $query$,
  'admins can create a region that is safe to remove'
);
select lives_ok(
  $$delete from public.regions where slug = 'unused-region'$$,
  'admins can delete an unused region'
);
select is(
  (select count(*)::integer from public.properties),
  3,
  'admin-created draft property is visible to admins'
);
select lives_ok(
  $query$
    update public.properties
    set title = 'Updated published property fixture'
    where id = '11111111-1111-4111-8111-111111111111'
  $query$,
  'admins can update properties'
);
select ok(
  (
    select updated_at > '2000-01-01 00:00:00+00'::timestamptz
    from public.properties
    where id = '11111111-1111-4111-8111-111111111111'
  ),
  'property update trigger refreshes updated_at'
);

reset role;

select lives_ok(
  $$delete from public.properties where id = '11111111-1111-4111-8111-111111111111'$$,
  'property fixture can be deleted'
);
select is(
  (select property_id from public.inquiries where id = '66666666-6666-4666-8666-666666666666'),
  null::uuid,
  'deleting a property preserves inquiry and clears its property reference'
);
select lives_ok(
  $$delete from auth.users where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'$$,
  'admin auth user fixture can be deleted'
);
select is(
  (select count(*)::integer from public.admin_roles),
  0,
  'deleting an auth user removes its admin role'
);

select * from finish();
rollback;
