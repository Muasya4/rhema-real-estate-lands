import "server-only";

import { io } from "next/cache";
import { cache } from "react";
import { SupabaseConfigurationError } from "../supabase/config";
import { createSupabaseServerClient } from "../supabase/server";
import {
  parsePublicJournalPost,
  type PublicJournalPost,
} from "./model";

export const journalPageSize = 12;

export type JournalListingPost = PublicJournalPost & {
  coverImageSrc: string | null;
};

export type JournalListingResult =
  | {
      status: "success";
      posts: JournalListingPost[];
      page: number;
      pageCount: number;
      total: number;
    }
  | { status: "error" };

export type JournalPostResult =
  | {
      status: "found";
      post: JournalListingPost;
    }
  | { status: "not-found" }
  | { status: "error" };

function logReadError(label: string, error: { code?: string; message?: string }) {
  const errorCode = error.code?.trim() || "unknown";
  const errorMessage = error.message?.trim() || "No details provided.";
  console.error(`${label} read failed: ${errorCode}. ${errorMessage}`);
}

export async function getPublishedJournalPosts(
  page = 1,
  pageSize = journalPageSize,
): Promise<JournalListingResult> {
  await io();

  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    !Number.isSafeInteger(pageSize) ||
    pageSize < 1
  ) {
    throw new RangeError("Journal page and page size must be positive integers.");
  }

  let client: ReturnType<typeof createSupabaseServerClient>;
  try {
    client = createSupabaseServerClient();
  } catch (error) {
    if (!(error instanceof SupabaseConfigurationError)) {
      throw error;
    }

    console.error("Journal listing configuration is incomplete.");
    return { status: "error" };
  }

  const now = new Date().toISOString();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  let data: unknown;
  let count: number | null;
  let queryError: { code?: string; message?: string } | null;

  try {
    const response = await client
      .from("blog_posts")
      .select(
        "id, title, slug, excerpt, content, cover_image, published_at",
        { count: "exact" },
      )
      .not("published_at", "is", null)
      .lte("published_at", now)
      .order("published_at", { ascending: false })
      .range(from, to);
    data = response.data;
    count = response.count;
    queryError = response.error;
  } catch (requestError) {
    if (!(requestError instanceof TypeError)) {
      throw requestError;
    }

    console.error("Journal listing request failed before a response arrived.");
    return { status: "error" };
  }

  if (queryError) {
    logReadError("Journal listing", queryError);
    return { status: "error" };
  }

  if (!Array.isArray(data) || !Number.isSafeInteger(count) || count === null) {
    console.error("Journal listing read returned an invalid response.");
    return { status: "error" };
  }

  const posts: JournalListingPost[] = [];

  for (const [index, rawPost] of data.entries()) {
    try {
      const post = parsePublicJournalPost(rawPost);
      posts.push({
        ...post,
        coverImageSrc: post.coverImage
          ? client.storage
              .from("property-images")
              .getPublicUrl(post.coverImage).data.publicUrl
          : null,
      });
    } catch (parseError) {
      if (!(parseError instanceof TypeError)) {
        throw parseError;
      }

      console.error(`Public journal record ${index + 1} is invalid.`);
      return { status: "error" };
    }
  }

  return {
    status: "success",
    posts,
    page,
    pageCount: Math.max(1, Math.ceil(count / pageSize)),
    total: count,
  };
}

export const getPublishedJournalPostBySlug = cache(
  async (slug: string): Promise<JournalPostResult> => {
    let client: ReturnType<typeof createSupabaseServerClient>;
    try {
      client = createSupabaseServerClient();
    } catch (error) {
      if (!(error instanceof SupabaseConfigurationError)) {
        throw error;
      }

      console.error("Journal detail configuration is incomplete.");
      return { status: "error" };
    }

    const now = new Date().toISOString();
    let data: unknown;
    let queryError: { code?: string; message?: string } | null;

    try {
      const response = await client
        .from("blog_posts")
        .select(
          "id, title, slug, excerpt, content, cover_image, published_at",
        )
        .eq("slug", slug)
        .not("published_at", "is", null)
        .lte("published_at", now)
        .maybeSingle();
      data = response.data;
      queryError = response.error;
    } catch (requestError) {
      if (!(requestError instanceof TypeError)) {
        throw requestError;
      }

      console.error("Journal detail request failed before a response arrived.");
      return { status: "error" };
    }

    if (queryError) {
      logReadError("Journal detail", queryError);
      return { status: "error" };
    }

    if (data === null) {
      return { status: "not-found" };
    }

    try {
      const post = parsePublicJournalPost(data);
      return {
        status: "found",
        post: {
          ...post,
          coverImageSrc: post.coverImage
            ? client.storage
                .from("property-images")
                .getPublicUrl(post.coverImage).data.publicUrl
            : null,
        },
      };
    } catch (parseError) {
      if (!(parseError instanceof TypeError)) {
        throw parseError;
      }

      console.error("Public journal detail record is invalid.");
      return { status: "error" };
    }
  },
);
