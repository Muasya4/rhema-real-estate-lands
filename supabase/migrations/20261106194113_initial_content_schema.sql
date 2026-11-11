create type public.property_region as enum (
  'nairobi_metropolitan_area',
  'ruiru',
  'kamakis',
  'thika_road_corridor',
  'kiambu_county',
  'machakos',
  'kajiado',
  'kagio',
  'kutus',
  'sagana',
  'baricho'
);

create type public.property_status as enum (
  'available',
  'reserved',
  'sold'
);

create schema app_private;
revoke all on schema app_private from public, anon, authenticated;
grant usage on schema app_private to authenticated, service_role;

create function app_private.is_valid_property_images(p_images jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $function$
  select case
    when p_images is null
      or pg_catalog.jsonb_typeof(p_images) <> 'array'
    then false
    else not exists (
      select 1
      from pg_catalog.jsonb_array_elements(p_images) as image(value)
      where pg_catalog.jsonb_typeof(image.value) <> 'object'
        or pg_catalog.jsonb_typeof(image.value -> 'path') <> 'string'
        or nullif(pg_catalog.btrim(image.value ->> 'path'), '') is null
        or pg_catalog.left(pg_catalog.btrim(image.value ->> 'path'), 1) = '/'
        or pg_catalog.strpos(pg_catalog.btrim(image.value ->> 'path'), '://') > 0
        or pg_catalog.jsonb_typeof(image.value -> 'alt') <> 'string'
        or nullif(pg_catalog.btrim(image.value ->> 'alt'), '') is null
        or image.value - 'path' - 'alt' <> '{}'::jsonb
    )
  end;
$function$;

revoke all on function app_private.is_valid_property_images(jsonb)
  from public, anon, authenticated, service_role;
grant execute on function app_private.is_valid_property_images(jsonb)
  to authenticated, service_role;

create function app_private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$function$;

revoke all on function app_private.set_updated_at() from public, anon, authenticated, service_role;

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  title text not null check (nullif(btrim(title), '') is not null),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text not null check (nullif(btrim(description), '') is not null),
  location text not null check (nullif(btrim(location), '') is not null),
  region public.property_region not null,
  price_kes bigint check (price_kes is null or price_kes >= 0),
  plot_size text check (plot_size is null or nullif(btrim(plot_size), '') is not null),
  status public.property_status,
  featured boolean not null default false,
  images jsonb not null default '[]'::jsonb
    check (app_private.is_valid_property_images(images)),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (nullif(btrim(name), '') is not null),
  email text not null check (nullif(btrim(email), '') is not null),
  phone text not null check (nullif(btrim(phone), '') is not null),
  message text not null check (nullif(btrim(message), '') is not null),
  property_id uuid references public.properties(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (nullif(btrim(title), '') is not null),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  excerpt text not null check (nullif(btrim(excerpt), '') is not null),
  content text not null check (nullif(btrim(content), '') is not null),
  cover_image text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.admin_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role = 'admin'),
  created_at timestamptz not null default now()
);

create index properties_published_region_created_idx
  on public.properties (region, created_at desc)
  where is_published = true;

create index inquiries_property_id_idx
  on public.inquiries (property_id);

create index blog_posts_published_at_idx
  on public.blog_posts (published_at desc)
  where published_at is not null;

create trigger properties_set_updated_at
before update on public.properties
for each row execute function app_private.set_updated_at();

create trigger blog_posts_set_updated_at
before update on public.blog_posts
for each row execute function app_private.set_updated_at();

alter table public.properties enable row level security;
alter table public.inquiries enable row level security;
alter table public.blog_posts enable row level security;
alter table public.admin_roles enable row level security;

revoke all on public.properties, public.inquiries, public.blog_posts, public.admin_roles
  from public, anon, authenticated;
grant usage on schema public to anon, authenticated, service_role;

grant select on public.properties, public.blog_posts to anon;
grant select, insert, update, delete on public.properties, public.blog_posts
  to authenticated;
grant select, insert, update, delete on public.inquiries to authenticated;
grant select on public.admin_roles to authenticated;
grant all on public.properties, public.inquiries, public.blog_posts, public.admin_roles
  to service_role;

create policy properties_public_read
  on public.properties
  for select
  to anon, authenticated
  using (is_published = true);

create policy properties_admin_read
  on public.properties
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.admin_roles
      where admin_roles.user_id = (select auth.uid())
        and admin_roles.role = 'admin'
    )
  );

create policy properties_admin_insert
  on public.properties
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.admin_roles
      where admin_roles.user_id = (select auth.uid())
        and admin_roles.role = 'admin'
    )
  );

create policy properties_admin_update
  on public.properties
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.admin_roles
      where admin_roles.user_id = (select auth.uid())
        and admin_roles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.admin_roles
      where admin_roles.user_id = (select auth.uid())
        and admin_roles.role = 'admin'
    )
  );

create policy properties_admin_delete
  on public.properties
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.admin_roles
      where admin_roles.user_id = (select auth.uid())
        and admin_roles.role = 'admin'
    )
  );

create policy inquiries_admin_read
  on public.inquiries
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.admin_roles
      where admin_roles.user_id = (select auth.uid())
        and admin_roles.role = 'admin'
    )
  );

create policy inquiries_admin_insert
  on public.inquiries
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.admin_roles
      where admin_roles.user_id = (select auth.uid())
        and admin_roles.role = 'admin'
    )
  );

create policy inquiries_admin_update
  on public.inquiries
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.admin_roles
      where admin_roles.user_id = (select auth.uid())
        and admin_roles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.admin_roles
      where admin_roles.user_id = (select auth.uid())
        and admin_roles.role = 'admin'
    )
  );

create policy inquiries_admin_delete
  on public.inquiries
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.admin_roles
      where admin_roles.user_id = (select auth.uid())
        and admin_roles.role = 'admin'
    )
  );

create policy blog_posts_public_read
  on public.blog_posts
  for select
  to anon, authenticated
  using (published_at is not null and published_at <= now());

create policy blog_posts_admin_read
  on public.blog_posts
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.admin_roles
      where admin_roles.user_id = (select auth.uid())
        and admin_roles.role = 'admin'
    )
  );

create policy blog_posts_admin_insert
  on public.blog_posts
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.admin_roles
      where admin_roles.user_id = (select auth.uid())
        and admin_roles.role = 'admin'
    )
  );

create policy blog_posts_admin_update
  on public.blog_posts
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.admin_roles
      where admin_roles.user_id = (select auth.uid())
        and admin_roles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.admin_roles
      where admin_roles.user_id = (select auth.uid())
        and admin_roles.role = 'admin'
    )
  );

create policy blog_posts_admin_delete
  on public.blog_posts
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.admin_roles
      where admin_roles.user_id = (select auth.uid())
        and admin_roles.role = 'admin'
    )
  );

create policy admin_roles_read_own
  on public.admin_roles
  for select
  to authenticated
  using (user_id = (select auth.uid()));
