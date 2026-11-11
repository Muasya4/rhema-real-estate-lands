create table public.regions (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (nullif(btrim(name), '') is not null),
  display_order integer not null check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index regions_name_ci_uidx
  on public.regions (lower(btrim(name)));

insert into public.regions (slug, name, display_order)
values
  ('nairobi-metropolitan-area', 'Nairobi Metropolitan Area', 0),
  ('ruiru', 'Ruiru', 1),
  ('kamakis', 'Kamakis', 2),
  ('thika-road-corridor', 'Thika Road corridor', 3),
  ('kiambu-county', 'Kiambu County', 4),
  ('machakos', 'Machakos', 5),
  ('kajiado', 'Kajiado', 6),
  ('kagio', 'Kagio', 7),
  ('kutus', 'Kutus', 8),
  ('sagana', 'Sagana', 9),
  ('baricho', 'Baricho', 10);

drop index public.properties_published_region_created_idx;

alter table public.properties
  alter column region type text
  using pg_catalog.replace(region::text, '_', '-');

alter table public.properties
  add constraint properties_region_slug_fkey
  foreign key (region)
  references public.regions (slug)
  on delete restrict;

drop type public.property_region;

create index properties_region_fkey_idx
  on public.properties (region);

create index properties_published_region_created_idx
  on public.properties (region, created_at desc)
  where is_published = true;

create trigger regions_set_updated_at
before update on public.regions
for each row execute function app_private.set_updated_at();

alter table public.regions enable row level security;

revoke all on public.regions from public, anon, authenticated;
grant select on public.regions to anon;
grant select, insert, update, delete on public.regions to authenticated;
grant all on public.regions to service_role;

create policy regions_public_read
  on public.regions
  for select
  to anon, authenticated
  using (true);

create policy regions_admin_insert
  on public.regions
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

create policy regions_admin_update
  on public.regions
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

create policy regions_admin_delete
  on public.regions
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