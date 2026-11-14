import { useId, type ReactNode } from "react";

const shapePath =
  "M 0.07 0.19 C 0.15 0.08 0.27 0.13 0.36 0.10 C 0.48 0.06 0.55 0.01 0.65 0.09 C 0.76 0.18 0.76 0.30 0.84 0.36 C 0.92 0.42 0.99 0.39 0.98 0.52 C 0.97 0.64 0.88 0.64 0.91 0.75 C 0.94 0.87 0.82 0.94 0.70 0.91 C 0.57 0.88 0.52 0.98 0.39 0.93 C 0.27 0.88 0.22 0.98 0.12 0.91 C 0.02 0.84 0.09 0.72 0.06 0.61 C 0.03 0.49 0.11 0.43 0.07 0.34 C 0.04 0.27 0.03 0.23 0.07 0.19 Z";

export function HeroImageShape({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const clipId = `hero-image-${useId().replaceAll(":", "")}`;

  return (
    <div className={`hero-image-shape${className ? ` ${className}` : ""}`}>
      <div
        className="hero-image-shape__media"
        style={{ clipPath: `url(#${clipId})` }}
      >
        {children}
      </div>
      <svg
        aria-hidden="true"
        className="hero-image-shape__contour"
        focusable="false"
        preserveAspectRatio="none"
        viewBox="0 0 1 1"
      >
        <defs>
          <clipPath clipPathUnits="objectBoundingBox" id={clipId}>
            <path d={shapePath} />
          </clipPath>
        </defs>
        <path
          className="hero-image-shape__outline hero-image-shape__outline--offset"
          d={shapePath}
          transform="translate(0.012 0.014)"
        />
        <path
          className="hero-image-shape__outline hero-image-shape__outline--edge"
          d={shapePath}
        />
      </svg>
    </div>
  );
}
