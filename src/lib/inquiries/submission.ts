import {
  validateInquiryForm,
  type InquiryValues,
} from "./validation";
import {
  getDefaultSiteContent,
  type SiteContent,
} from "../site-content/defaults";

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
  content: SiteContent = getDefaultSiteContent(),
): Promise<InquiryActionState> {
  const validation = validateInquiryForm(formData, content);

  if (!validation.success) {
    return {
      status: "error",
      message: content["inquiry.reviewFields"],
      fieldErrors: validation.fieldErrors,
    };
  }

  const honeypot = formData.get("website");
  if (typeof honeypot === "string" && honeypot.trim()) {
    return {
      status: "error",
      message: content["inquiry.retry"],
      fieldErrors: {},
    };
  }

  const token = formData.get("turnstileToken");
  if (typeof token !== "string" || !token.trim()) {
    return {
      status: "error",
      message: content["inquiry.completeSecurity"],
      fieldErrors: {},
    };
  }

  const verified = await dependencies.verifyTurnstile(token);
  if (!verified) {
    return {
      status: "error",
      message: content["inquiry.securityExpired"],
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
        message: content["inquiry.propertyUnavailable"],
        fieldErrors: { propertyId: content["inquiry.reloadProperty"] },
      };
    }

    if (propertyCheck === "error") {
      return {
        status: "error",
        message: content["inquiry.verifyProperty"],
        fieldErrors: {},
      };
    }
  }

  const inserted = await dependencies.insertInquiry(validation.values);
  if (!inserted) {
    return {
      status: "error",
      message: content["inquiry.notSent"],
      fieldErrors: {},
    };
  }

  return {
    status: "success",
    message: content["inquiry.success"],
    fieldErrors: {},
  };
}
