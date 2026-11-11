# Testing Phase 03 in a Temporary Supabase Project

Use a throwaway Supabase project named, for example, `rhema-schema-test`. Do not use the client's production project. Delete this test project after verification to remove its database and Storage test resources.

## 1. Check whether the failed SQL run left partial objects

In the temporary project's SQL Editor, run this read-only query:

```sql
select
  to_regtype('public.property_region') as property_region_type,
  to_regtype('public.property_status') as property_status_type,
  to_regnamespace('app_private') as app_private_schema,
  to_regclass('public.properties') as properties,
  to_regclass('public.inquiries') as inquiries,
  to_regclass('public.blog_posts') as blog_posts,
  to_regclass('public.admin_roles') as admin_roles;
```

The four application tables were reported missing after the first attempt. If either type or `app_private_schema` exists, use a fresh throwaway Supabase project rather than retrying the non-idempotent migration on a partially initialized database. If all results are null, continue.

## 2. Apply the application schema

Open `supabase/migrations/20261106194113_initial_content_schema.sql` in the repository. Copy the full file into the temporary project's SQL Editor and run it.

This migration creates only Rhema's application schema. It does not alter, grant on, or write rows into Supabase-managed Storage tables. The migration is intended for a clean project.

Then verify the application tables:

```sql
select
  to_regclass('public.properties') as properties,
  to_regclass('public.inquiries') as inquiries,
  to_regclass('public.blog_posts') as blog_posts,
  to_regclass('public.admin_roles') as admin_roles;
```

All four should return their table names.

## 3. Create the public image bucket

In the Supabase Dashboard, open **Storage**, choose **New bucket**, set the bucket name to `property-images`, and enable **Public bucket**. Set the maximum file size to **5,242,880 bytes (5 MiB)** and the allowed MIME types to **image/jpeg**, **image/png**, and **image/webp**. These limits match the server-side checks in the admin property editor.

Public buckets allow retrieval by public object URL. Do not add a public object-list policy.

## 4. Add admin-only Storage policies in the Dashboard

Open **Storage > Policies** for `storage.objects`. Add four policies, each applying to the `property-images` bucket and the `authenticated` role:

- **SELECT**, policy name `property_images_admin_select`, condition below as `USING`
- **INSERT**, policy name `property_images_admin_insert`, condition below as `WITH CHECK`
- **UPDATE**, policy name `property_images_admin_update`, condition below as both `USING` and `WITH CHECK`
- **DELETE**, policy name `property_images_admin_delete`, condition below as `USING`

Use this condition, with the appropriate bucket restriction and role lookup:

```sql
bucket_id = 'property-images'
and exists (
  select 1
  from public.admin_roles
  where admin_roles.user_id = (select auth.uid())
    and admin_roles.role = 'admin'
)
```

The SELECT policy supports authorized admin listing and Storage upsert. The bucket remains publicly readable by URL, while Storage object listing and writes are limited to admins. Create these policies through the Storage Dashboard because Supabase manages ownership of `storage.objects`.

## 5. Confirm the setup

Run:

```sql
select id, public
from storage.buckets
where id = 'property-images';

select policyname, cmd
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and policyname like 'property_images_admin_%'
order by policyname;
```

The bucket should be public and the four admin policies should appear. Do not insert test files by writing directly to `storage.objects`; uploads and deletes must go through the Storage API.

The pgTAP suite at `supabase/tests/database/content_schema_test.sql` requires the Supabase CLI/local test runner. Dashboard checks are a smoke test, not a replacement for running the automated policy suite.

## 6. Remove the test project

When finished, delete the entire `rhema-schema-test` project from its project settings. This removes its database, bucket, policies, and any uploaded test files. Do not delete the migration or test files from the repository. Never run cleanup SQL against the client's project.
