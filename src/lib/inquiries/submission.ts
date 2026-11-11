import {
  validateInquiryForm,
  type InquiryValues,
} from "./validation";

export type InquiryActionState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors: Partial<
    Record<"name" | "email" | "phone" | "message" | "propertyId", string>
  >;
};

export type PublishedPropertyCheck = "published" | "not-published" | "error";

export type InquirySubmissionDependencies = {
  verifyTurnstile: (token: string) => Promise<boolean>;
  checkProperty: (propertyId: string) => Promise<PublishedPropertyCheck>;
  insertInquiry: (values: InquiryValues) => Promise<boolean>;
};

export async function processInquirySubmission(
  formData: FormData,
  dependencies: InquirySubmissionDependencies,
): Promise<InquiryActionState> {
  const validation = validateInquiryForm(formData);

  if (!validation.success) {
    return {
      status: "error",
      message: "Please review the highlighted fields.",
      fieldErrors: validation.fieldErrors,
    };
  }

  const honeypot = formData.get("website");
  if (typeof honeypot === "string" && honeypot.trim()) {
    return {
      status: "error",
      message: "We could not send your inquiry. Please try again.",
      fieldErrors: {},
    };
  }

  const token = formData.get("turnstileToken");
  if (typeof token !== "string" || !token.trim()) {
    return {
      status: "error",
      message: "Complete the security check before sending.",
      fieldErrors: {},
    };
  }

  const verified = await dependencies.verifyTurnstile(token);
  if (!verified) {
    return {
      status: "error",
      message: "The security check expired or could not be verified. Please try again.",
      fieldErrors: {},
    };
  }

  if (validation.values.propertyId) {
    const propertyCheck = await dependencies.checkProperty(
      validation.values.propertyId,
    );

    if (propertyCheck === "not-published") {
      return {
        status: "error",
        message: "This property is not available for public inquiries.",
        fieldErrors: { propertyId: "Reload the property page and try again." },
      };
    }

    if (propertyCheck === "error") {
      return {
        status: "error",
        message: "We could not verify the property. Please try again.",
        fieldErrors: {},
      };
    }
  }

  const inserted = await dependencies.insertInquiry(validation.values);
  if (!inserted) {
    return {
      status: "error",
      message:
        "Your inquiry was not sent. Please try again or contact Rhema by phone or WhatsApp.",
      fieldErrors: {},
    };
  }

  return {
    status: "success",
    message: "Thank you. Rhema has received your inquiry.",
    fieldErrors: {},
  };
}
