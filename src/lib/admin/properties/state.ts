import type { PropertyFieldErrors } from "./validation";

export type PropertyActionState = {
  status: "idle" | "error" | "warning";
  message: string;
  fieldErrors: PropertyFieldErrors;
};

export const initialPropertyActionState: PropertyActionState = {
  status: "idle",
  message: "",
  fieldErrors: {},
};
