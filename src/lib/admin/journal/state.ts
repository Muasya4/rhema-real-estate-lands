import type { JournalFieldErrors } from "./validation";

export type JournalActionState = {
  status: "idle" | "error";
  message: string;
  fieldErrors: JournalFieldErrors;
};

export const initialJournalActionState: JournalActionState = {
  status: "idle",
  message: "",
  fieldErrors: {},
};
