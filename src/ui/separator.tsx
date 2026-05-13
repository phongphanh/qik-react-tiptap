import * as React from "react";
import { cn } from "../lib/utils";

export function Separator({
  className,
  orientation = "vertical",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { orientation?: "horizontal" | "vertical" }) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn("rt-separator", className)}
      {...props}
    />
  );
}
