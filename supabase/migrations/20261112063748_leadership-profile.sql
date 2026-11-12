create table public.leadership_profile (
  profile_key text primary key default 'ceo' check (profile_key = 'ceo'),
  full_name text not null check (
    nullif(btrim(full_name), '') is not null
    and char_length(full_name) <= 100
  ),
  title text not null check (
    nullif(btrim(title), '') is not null
    and char_length(title) <= 100
  ),
  email text not null check (
    email = btrim(email)
    and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    and char_length(email) <= 254
  ),
  biography text check (biography is null or char_length(biography) <= 2000),
  image_path text check (
    image_path is null
    or image_path ~ '^leadership/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$'
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.leadership_profile (
  profile_key,
  full_name,
  title,
  email
)
values (
  'ceo',
  'Evans',
  'Chief Executive Officer',
  'evans@rhemarealestates.com'
);

create trigger leadership_profile_set_updated_at
before update on public.leadership_profile
for each row execute function app_private.set_updated_at();

alter table public.leadership_profile enable row level security;

revoke all on public.leadership_profile from public, anon, authenticated;
grant select on public.leadership_profile to anon;
grant select, update on public.leadership_profile to authenticated;
grant all on public.leadership_profile to service_role;

create policy leadership_profile_public_read
  on public.leadership_profile
  for select
  to anon, authenticated
  using (true);

create policy leadership_profile_admin_update
  on public.leadership_profile
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