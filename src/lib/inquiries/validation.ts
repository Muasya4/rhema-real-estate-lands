import {
  getDefaultSiteContent,
  type SiteContent,
} from "../site-content/defaults";

export const inquiryFieldLimits = {
  name: 120,
  email: 254,
  phone: 32,
  message: 5000,
} as const;

export type InquiryValues = {
  name: string;
  email: string;
  phone: string;
  message: string;
  propertyId: string | null;
};

export type InquiryField = keyof typeof inquiryFieldLimits | "propertyId";
export type InquiryFieldErrors = Partial<Record<InquiryField, string>>;

export type InquiryValidationResult =
  | { success: true; values: InquiryValues }
  | { success: false; fieldErrors: InquiryFieldErrors };

function getStringField(formData: FormData, name: string): string | null {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : null;
}

export function isUuid(value: string): boolean {
  return /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(value);
}

export function validateInquiryForm(
  formData: FormData,
  content: SiteContent = getDefaultSiteContent(),
): InquiryValidationResult {
  const name = getStringField(formData, "name") ?? "";
  const email = getStringField(formData, "email") ?? "";
  const phone = getStringField(formData, "phone") ?? "";
  const message = getStringField(formData, "message") ?? "";
  const rawPropertyId = getStringField(formData, "propertyId") ?? "";
  const fieldErrors: InquiryFieldErrors = {};

  if (!name) {
    fieldErrors.name = content["inquiry.nameRequired"];
  } else if (name.length > inquiryFieldLimits.name) {
    fieldErrors.name = content["inquiry.nameTooLong"];
  }

  if (!email) {
    fieldErrors.email = content["inquiry.emailRequired"];
  } else if (
    email.length > inquiryFieldLimits.email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    fieldErrors.email = content["inquiry.emailInvalid"];
  }

  const phoneDigits = phone.replace(/\D/g, "");
  if (!phone) {
    fieldErrors.phone = content["inquiry.phoneRequired"];
  } else if (
    phone.length > inquiryFieldLimits.phone ||
    !/^[+\d().\-\s]+$/.test(phone) ||
    phoneDigits.length < 7 ||
    phoneDigits.length > 15
  ) {
    fieldErrors.phone = content["inquiry.phoneInvalid"];
  }

  if (!message) {
    fieldErrors.message = content["inquiry.messageRequired"];
  } else if (message.length > inquiryFieldLimits.message) {
    fieldErrors.message = content["inquiry.messageTooLong"];
  }

  if (rawPropertyId && !isUuid(rawPropertyId)) {
    fieldErrors.propertyId = content["inquiry.propertyIdInvalid"];
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors };
  }

  return {
    success: true,
    values: {
      name,
      email,
      phone,
      message,
      propertyId: rawPropertyId || null,
    },
  };
}
