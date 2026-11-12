import type { SiteContentKey } from "@/lib/site-content/defaults";

export type SiteContentActionState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors: Partial<Record<SiteContentKey, string>>;
};

export const initialSiteContentActionState: SiteContentActionState = {
  status: "idle",
  message: "",
  fieldErrors: {},
};
