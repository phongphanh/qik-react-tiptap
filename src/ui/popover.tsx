import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "../lib/utils";
import { getThemeAttribute, useEditorTheme } from "../theme";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverClose = PopoverPrimitive.Close;

export function PopoverContent({
  className,
  align = "start",
  sideOffset = 8,
  ...props
}: PopoverPrimitive.PopoverContentProps) {
  const theme = useEditorTheme();

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        data-rt-theme={getThemeAttribute(theme)}
        className={cn("rt-popover-content", className)}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}
