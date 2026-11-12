import type { PropertyStatus } from "@/lib/properties/model";
import type { SiteContent } from "@/lib/site-content/defaults";

export type { PropertyStatus } from "@/lib/properties/model";

type StatusBadgeProps = {
  status: PropertyStatus;
  content: SiteContent;
};

const statusContentKeys = {
  available: "properties.statusAvailable",
  reserved: "properties.statusReserved",
  sold: "properties.statusSold",
} as const;

export function StatusBadge({ content, status }: StatusBadgeProps) {
  return (
    <span className={`status-badge status-badge--${status}`}>
      {content[statusContentKeys[status]]}
    </span>
  );
}
