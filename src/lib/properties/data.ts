import "server-only";

import { io } from "next/cache";
import { cache } from "react";
import { SupabaseConfigurationError } from "../supabase/config";
import { createSupabaseServerClient } from "../supabase/server";
import {
  parsePublicPropertyDetail,
  parsePublicProperty,
  type PublicPropertyDetail,
  type PublicProperty,
} from "./model";

export type PropertyListingItem = PublicProperty & {
  imageSrc: string;
  imageAlt: string;
  imageIsPlaceholder: boolean;
};

export type PropertyListingResult =
  | { status: "success"; properties: PropertyListingItem[] }
  | { status: "error" };

export type PropertyDetailResult =
  | { status: "found"; property: PublicPropertyDetail }
  | { status: "not-found" }
  | { status: "error" };

const placeholderImage = {
  src: "/land-placeholder.svg",
  alt: "Illustrated land contour placeholder, not a property photograph.",
};

export async function getPublishedProperties(): Promise<PropertyListingResult> {
  await io();

  let client: ReturnType<typeof createSupabaseServerClient>;

  try {
    client = createSupabaseServerClient();
  } catch (error) {
    if (!(error instanceof SupabaseConfigurationError)) {
      throw error;
    }

    console.error("Property listing configuration is incomplete.");
    return { status: "error" };
  }

  let data: unknown;
  let queryError: { code?: string; message?: string } | null;

  try {
    const response = await client
      .from("properties")
      .select(
        "id, title, slug, location, price_kes, plot_size, status, featured, created_at, images",
      )
      .eq("is_published", true)
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });
    data = response.data;
    queryError = response.error;
  } catch (requestError) {
    if (!(requestError instanceof TypeError)) {
      throw requestError;
    }

    console.error("Property listing request failed before a response arrived.");
    return { status: "error" };
  }

  if (queryError) {
    const errorCode = queryError.code?.trim() || "unknown";
    const errorMessage = queryError.message?.trim() || "No details provided.";
    console.error(
      `Property listing read failed: ${errorCode}. ${errorMessage}`,
    );
    return { status: "error" };
  }

  if (!Array.isArray(data)) {
    console.error("Property listing read returned an invalid response.");
    return { status: "error" };
  }

  const properties: PropertyListingItem[] = [];

  for (const [index, rawProperty] of data.entries()) {
    let property: PublicProperty;

    try {
      property = parsePublicProperty(rawProperty);
    } catch (parseError) {
      if (!(parseError instanceof TypeError)) {
        throw parseError;
      }

      console.error(`Public property record ${index + 1} is invalid.`);
      return { status: "error" };
    }

    const image = property.images[0];
    const imageSrc = image
      ? client.storage.from("property-images").getPublicUrl(image.path).data
          .publicUrl
      : placeholderImage.src;

    properties.push({
      ...property,
      imageSrc,
      imageAlt: image?.alt ?? placeholderImage.alt,
      imageIsPlaceholder: !image,
    });
  }

  return { status: "success", properties };
}

export const getPublishedPropertyBySlug = cache(
  async (slug: string): Promise<PropertyDetailResult> => {
    let client: ReturnType<typeof createSupabaseServerClient>;

    try {
      client = createSupabaseServerClient();
    } catch (error) {
      if (!(error instanceof SupabaseConfigurationError)) {
        throw error;
      }

      console.error("Property detail configuration is incomplete.");
      return { status: "error" };
    }

    let data: unknown;
    let queryError: { code?: string; message?: string } | null;

    try {
      const response = await client
        .from("properties")
        .select(
          "id, title, slug, description, location, price_kes, plot_size, status, featured, created_at, images",
        )
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      data = response.data;
      queryError = response.error;
    } catch (requestError) {
      if (!(requestError instanceof TypeError)) {
        throw requestError;
      }

      console.error("Property detail request failed before a response arrived.");
      return { status: "error" };
    }

    if (queryError) {
      const errorCode = queryError.code?.trim() || "unknown";
      const errorMessage = queryError.message?.trim() || "No details provided.";
      console.error(`Property detail read failed: ${errorCode}. ${errorMessage}`);
      return { status: "error" };
    }

    if (data === null) {
      return { status: "not-found" };
    }

    try {
      const property = parsePublicPropertyDetail(data, (path) =>
        client.storage.from("property-images").getPublicUrl(path).data
          .publicUrl,
      );
      return { status: "found", property };
    } catch (parseError) {
      if (!(parseError instanceof TypeError)) {
        throw parseError;
      }

      console.error("Public property detail record is invalid.");
      return { status: "error" };
    }
  },
);
