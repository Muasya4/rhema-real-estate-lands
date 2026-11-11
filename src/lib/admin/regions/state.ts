export type RegionActionState = {
  status: "idle" | "error" | "success";
  message: string;
};

export const initialRegionActionState: RegionActionState = {
  status: "idle",
  message: "",
};
