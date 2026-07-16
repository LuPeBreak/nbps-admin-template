import type { ReactNode } from "react";

interface PageBackgroundProps {
  children?: ReactNode;
  maskPosition?: "center" | "top";
}

const gridClasses =
  "absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_0.5px,transparent_0.5px),linear-gradient(to_bottom,hsl(var(--border))_0.5px,transparent_0.5px)] bg-[size:4rem_4rem]";

export function PageBackground({
  children,
  maskPosition = "center",
}: PageBackgroundProps) {
  const mask =
    maskPosition === "top"
      ? "[mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_30%,transparent_70%)]"
      : "[mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_40%,transparent_70%)]";

  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <div className={`${gridClasses} ${mask}`} />
      {children}
    </div>
  );
}
