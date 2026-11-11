export const minimumAdminPasswordLength = 15;
export const maximumAuthFieldLength = 1024;
export const maximumEmailLength = 254;

export type AuthFieldErrors = Partial<
  Record<"email" | "password" | "passwordConfirmation", string>
>;

export function readFormString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export function normalizeAdminEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidAdminEmail(value: string): boolean {
  return (
    value.length > 0 &&
    value.length <= maximumEmailLength &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  );
}

export function validateNewAdminPassword(
  password: string,
  confirmation: string,
): AuthFieldErrors {
  const errors: AuthFieldErrors = {};

  if (password.length < minimumAdminPasswordLength) {
    errors.password = `Use at least ${minimumAdminPasswordLength} characters.`;
  } else if (password.length > maximumAuthFieldLength) {
    errors.password = "This password is too long.";
  }

  if (confirmation !== password) {
    errors.passwordConfirmation = "The passwords do not match.";
  }

  return errors;
}

export function getSafeAdminPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return "/admin";
  }

  try {
    const url = new URL(value, "https://rhema.invalid");
    if (
      url.origin !== "https://rhema.invalid" ||
      (url.pathname !== "/admin" && !url.pathname.startsWith("/admin/"))
    ) {
      return "/admin";
    }

    return `${url.pathname}${url.search}`;
  } catch {
    return "/admin";
  }
}
