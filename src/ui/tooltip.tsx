import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "../lib/utils";
import { getThemeAttribute, useEditorTheme } from "../theme";

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export function TooltipContent({
  className,
  sideOffset = 8,
  ...props
}: TooltipPrimitive.TooltipContentProps) {
  const theme = useEditorTheme();

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        data-rt-theme={getThemeAttribute(theme)}
        className={cn("rt-tooltip-content", className)}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}
