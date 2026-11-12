create table public.site_content (
  content_key text primary key check (
    content_key ~ '^[a-z0-9._-]+$'
    and char_length(content_key) <= 120
  ),
  content_value text not null check (
    nullif(btrim(content_value), '') is not null
    and char_length(content_value) <= 2000
  ),
  updated_at timestamptz not null default now()
);

create trigger site_content_set_updated_at
before update on public.site_content
for each row execute function app_private.set_updated_at();

alter table public.site_content enable row level security;

revoke all on public.site_content from public, anon, authenticated, service_role;
grant select on public.site_content to anon, authenticated;
grant insert, update, delete on public.site_content to authenticated;
grant all on public.site_content to service_role;

create policy site_content_public_read
  on public.site_content
  for select
  to anon, authenticated
  using (true);

create policy site_content_admin_insert
  on public.site_content
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

create policy site_content_admin_update
  on public.site_content
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

create policy site_content_admin_delete
  on public.site_content
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