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
): InquiryValidationResult {
  const name = getStringField(formData, "name") ?? "";
  const email = getStringField(formData, "email") ?? "";
  const phone = getStringField(formData, "phone") ?? "";
  const message = getStringField(formData, "message") ?? "";
  const rawPropertyId = getStringField(formData, "propertyId") ?? "";
  const fieldErrors: InquiryFieldErrors = {};

  if (!name) {
    fieldErrors.name = "Enter your name.";
  } else if (name.length > inquiryFieldLimits.name) {
    fieldErrors.name = "Use 120 characters or fewer.";
  }

  if (!email) {
    fieldErrors.email = "Enter your email address.";
  } else if (
    email.length > inquiryFieldLimits.email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    fieldErrors.email = "Enter a valid email address.";
  }

  const phoneDigits = phone.replace(/\D/g, "");
  if (!phone) {
    fieldErrors.phone = "Enter your phone number.";
  } else if (
    phone.length > inquiryFieldLimits.phone ||
    !/^[+\d().\-\s]+$/.test(phone) ||
    phoneDigits.length < 7 ||
    phoneDigits.length > 15
  ) {
    fieldErrors.phone = "Enter a valid phone number.";
  }

  if (!message) {
    fieldErrors.message = "Enter a message.";
  } else if (message.length > inquiryFieldLimits.message) {
    fieldErrors.message = "Use 5,000 characters or fewer.";
  }

  if (rawPropertyId && !isUuid(rawPropertyId)) {
    fieldErrors.propertyId = "This property reference is not valid.";
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
