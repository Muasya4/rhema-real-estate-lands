import "server-only";

import { SupabaseConfigurationError } from "../../supabase/config";
import { createSupabaseAuthServerClient } from "../../supabase/auth-server";
import {
  parseAdminJournalPost,
  type AdminJournalPost,
} from "../../journal/model";

export type AdminJournalListPost = AdminJournalPost & {
  coverImageSrc: string | null;
  publicationChoice: "draft" | "published" | "scheduled";
};

export type AdminJournalListResult =
  | { status: "success"; posts: AdminJournalListPost[] }
  | { status: "error" };

export type AdminJournalPostResult =
  | { status: "found"; post: AdminJournalListPost }
  | { status: "not-found" }
  | { status: "error" };

const journalSelection =
  "id, title, slug, excerpt, content, cover_image, published_at, created_at, updated_at";
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function getClient() {
  try {
    return await createSupabaseAuthServerClient();
  } catch (error) {
    if (!(error instanceof SupabaseConfigurationError)) {
      throw error;
    }

    console.error("Admin Journal configuration is incomplete.");
    return null;
  }
}

function mapPost(
  client: Awaited<ReturnType<typeof createSupabaseAuthServerClient>>,
  value: unknown,
): AdminJournalListPost {
  const post = parseAdminJournalPost(value);
  const publicationChoice = !post.publishedAt
    ? "draft"
    : Date.parse(post.publishedAt) > Date.now()
      ? "scheduled"
      : "published";
  return {
    ...post,
    coverImageSrc: post.coverImage
      ? client.storage
          .from("property-images")
          .getPublicUrl(post.coverImage).data.publicUrl
      : null,
    publicationChoice,
  };
}

export async function getAdminJournalPosts(): Promise<AdminJournalListResult> {
  const client = await getClient();
  if (!client) {
    return { status: "error" };
  }

  try {
    const { data, error } = await client
      .from("blog_posts")
      .select(journalSelection)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error(`Admin Journal list read failed: ${error.code ?? "unknown"}.`);
      return { status: "error" };
    }

    if (!Array.isArray(data)) {
      console.error("Admin Journal list returned an invalid response.");
      return { status: "error" };
    }

    try {
      return { status: "success", posts: data.map((post) => mapPost(client, post)) };
    } catch (error) {
      if (!(error instanceof TypeError)) {
        throw error;
      }

      console.error("Admin Journal list contains an invalid record.");
      return { status: "error" };
    }
  } catch (error) {
    if (!(error instanceof TypeError)) {
      throw error;
    }

    console.error("Admin Journal list request could not reach Supabase.");
    return { status: "error" };
  }
}

export async function getAdminJournalPost(
  id: string,
): Promise<AdminJournalPostResult> {
  if (!uuidPattern.test(id)) {
    return { status: "not-found" };
  }

  const client = await getClient();
  if (!client) {
    return { status: "error" };
  }

  try {
    const { data, error } = await client
      .from("blog_posts")
      .select(journalSelection)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error(`Admin Journal read failed: ${error.code ?? "unknown"}.`);
      return { status: "error" };
    }
    if (data === null) {
      return { status: "not-found" };
    }

    try {
      return { status: "found", post: mapPost(client, data) };
    } catch (error) {
      if (!(error instanceof TypeError)) {
        throw error;
      }

      console.error("Admin Journal record is invalid.");
      return { status: "error" };
    }
  } catch (error) {
    if (!(error instanceof TypeError)) {
      throw error;
    }

    console.error("Admin Journal request could not reach Supabase.");
    return { status: "error" };
  }
}
