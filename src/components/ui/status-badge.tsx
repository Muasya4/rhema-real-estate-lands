import type { PropertyStatus } from "@/lib/properties/model";

export type { PropertyStatus } from "@/lib/properties/model";

type StatusBadgeProps = {
  status: PropertyStatus;
};

const statusLabels: Record<PropertyStatus, string> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`status-badge status-badge--${status}`}>
      {statusLabels[status]}
    </span>
  );
}
