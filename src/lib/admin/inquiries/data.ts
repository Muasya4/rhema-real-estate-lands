import "server-only";

import { SupabaseConfigurationError } from "../../supabase/config";
import { createSupabaseAuthServerClient } from "../../supabase/auth-server";

export type AdminInquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  propertyId: string | null;
  property: {
    id: string;
    title: string;
  } | null;
  createdAt: string;
};

export type AdminInquiryListResult =
  | { status: "success"; inquiries: AdminInquiry[] }
  | { status: "error" };

const inquirySelection =
  "id, name, email, phone, message, property_id, created_at, property:properties!inquiries_property_id_fkey(id, title)";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseAdminInquiry(value: unknown): AdminInquiry {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.name !== "string" ||
    !value.name.trim() ||
    typeof value.email !== "string" ||
    !value.email.trim() ||
    typeof value.phone !== "string" ||
    !value.phone.trim() ||
    typeof value.message !== "string" ||
    !value.message.trim() ||
    (value.property_id !== null && typeof value.property_id !== "string") ||
    typeof value.created_at !== "string" ||
    !Number.isFinite(Date.parse(value.created_at))
  ) {
    throw new TypeError("Admin inquiry record is invalid.");
  }

  let property: AdminInquiry["property"] = null;
  if (value.property !== null && value.property !== undefined) {
    if (
      !isRecord(value.property) ||
      typeof value.property.id !== "string" ||
      typeof value.property.title !== "string" ||
      !value.property.title.trim() ||
      value.property.id !== value.property_id
    ) {
      throw new TypeError("Admin inquiry property is invalid.");
    }

    property = {
      id: value.property.id,
      title: value.property.title,
    };
  }

  return {
    id: value.id,
    name: value.name,
    email: value.email,
    phone: value.phone,
    message: value.message,
    propertyId: value.property_id,
    property,
    createdAt: value.created_at,
  };
}

async function getClient() {
  try {
    return await createSupabaseAuthServerClient();
  } catch (error) {
    if (!(error instanceof SupabaseConfigurationError)) {
      throw error;
    }

    console.error("Admin inquiry database configuration is incomplete.");
    return null;
  }
}

export async function getAdminInquiries(): Promise<AdminInquiryListResult> {
  const client = await getClient();
  if (!client) {
    return { status: "error" };
  }

  let response: {
    data: unknown;
    error: { code?: string } | null;
  };
  try {
    response = await client
      .from("inquiries")
      .select(inquirySelection)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });
  } catch (error) {
    if (!(error instanceof TypeError)) {
      throw error;
    }

    console.error("Admin inquiry list request could not reach Supabase.");
    return { status: "error" };
  }

  if (response.error) {
    console.error(
      `Admin inquiry list read failed: ${response.error.code ?? "unknown"}.`,
    );
    return { status: "error" };
  }

  if (!Array.isArray(response.data)) {
    console.error("Admin inquiry list returned an invalid response.");
    return { status: "error" };
  }

  try {
    return {
      status: "success",
      inquiries: response.data.map(parseAdminInquiry),
    };
  } catch (error) {
    if (!(error instanceof TypeError)) {
      throw error;
    }

    console.error("Admin inquiry list contains an invalid record.");
    return { status: "error" };
  }
}
