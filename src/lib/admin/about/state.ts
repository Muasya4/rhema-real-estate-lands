export type LeadershipFieldErrors = Partial<
  Record<"fullName" | "title" | "email" | "biography" | "imageFile", string>
>;

export type LeadershipActionState = {
  status: "idle" | "error";
  message: string;
  fieldErrors: LeadershipFieldErrors;
};

export const initialLeadershipActionState: LeadershipActionState = {
  status: "idle",
  message: "",
  fieldErrors: {},
};
