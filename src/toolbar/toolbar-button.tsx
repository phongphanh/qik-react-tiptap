import * as React from "react";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip";

export interface ToolbarButtonProps
  extends React.ComponentProps<typeof Button> {
  label: string;
}

export function ToolbarButton({
  label,
  children,
  onMouseDown,
  ...props
}: React.PropsWithChildren<ToolbarButtonProps>) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={label}
          onMouseDown={(event) => {
            event.preventDefault();
            onMouseDown?.(event);
          }}
          {...props}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
