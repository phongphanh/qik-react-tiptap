import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "../lib/utils";

export function Separator({
  className,
  orientation = "vertical",
  ...props
}: SeparatorPrimitive.SeparatorProps) {
  return (
    <SeparatorPrimitive.Root
      orientation={orientation}
      className={cn("rt-separator", className)}
      {...props}
    />
  );
}
