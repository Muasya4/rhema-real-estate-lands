"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { SupabaseConfigurationError } from "@/lib/supabase/config";
import { verifyTurnstileToken } from "./turnstile";
import {
  processInquirySubmission,
  type InquiryActionState,
} from "./submission";

function getUnavailableState(): InquiryActionState {
  return {
    status: "error",
    message:
      "The inquiry form is not available right now. Please call or WhatsApp Rhema.",
    fieldErrors: {},
  };
}

export async function submitInquiry(
  _previousState: InquiryActionState,
  formData: FormData,
): Promise<InquiryActionState> {
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY?.trim();
  const supabaseSecret = process.env.SUPABASE_SECRET_KEY?.trim();

  if (!turnstileSecret || !supabaseSecret) {
    console.error("Inquiry form server configuration is incomplete.");
    return getUnavailableState();
  }

  return processInquirySubmission(formData, {
    verifyTurnstile: (token) =>
      verifyTurnstileToken(token, turnstileSecret),
    checkProperty: async (propertyId) => {
      try {
        const client = createSupabaseServerClient();
        const { data, error } = await client
          .from("properties")
          .select("id")
          .eq("id", propertyId)
          .eq("is_published", true)
          .maybeSingle();

        if (error) {
          console.error(
            `Inquiry property verification failed: ${error.code ?? "unknown"}.`,
          );
          return "error";
        }

        return data ? "published" : "not-published";
      } catch (error) {
        if (error instanceof SupabaseConfigurationError) {
          console.error("Inquiry property verification is misconfigured.");
          return "error";
        }

        throw error;
      }
    },
    insertInquiry: async (values) => {
      try {
        const client = createSupabaseServiceClient();
        const { error } = await client.from("inquiries").insert({
          name: values.name,
          email: values.email,
          phone: values.phone,
          message: values.message,
          property_id: values.propertyId,
        });

        if (error) {
          console.error(
            `Inquiry insert failed: ${error.code ?? "unknown"}.`,
          );
          return false;
        }

        return true;
      } catch (error) {
        if (error instanceof SupabaseConfigurationError) {
          console.error("Inquiry storage is misconfigured.");
          return false;
        }

        throw error;
      }
    },
  });
}
