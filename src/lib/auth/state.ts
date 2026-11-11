import type { AuthFieldErrors } from "./policy";

export type AuthActionState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors: AuthFieldErrors;
};

export const initialAuthActionState: AuthActionState = {
  status: "idle",
  message: "",
  fieldErrors: {},
};
