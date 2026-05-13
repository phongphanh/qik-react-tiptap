import type { Editor } from "@tiptap/core";
import { Eraser, Palette } from "lucide-react";
import * as React from "react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import type { ColorPaletteDefinition } from "./types";

export interface ColorPopoverProps {
  active?: boolean;
  editor: Editor;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  palette: ColorPaletteDefinition;
}

export function ColorPopover({ active, editor, open, onOpenChange, palette }: ColorPopoverProps) {
  const colorInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              active={active}
              aria-label={palette.label}
              onMouseDown={(event) => event.preventDefault()}
            >
              {palette.icon}
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>{palette.label}</TooltipContent>
      </Tooltip>

      <PopoverContent className="rt-color-popover">
        <button
          type="button"
          className="rt-color-action-row"
          onClick={() => palette.clear(editor)}
        >
          <Eraser />
          <span>Remove color</span>
        </button>

        <div className="rt-swatch-grid">
          {palette.colors.map((color) => (
            <button
              key={color}
              type="button"
              className="rt-swatch"
              style={{ backgroundColor: color }}
              aria-label={color}
              onClick={() => palette.command(editor, color)}
            />
          ))}
        </div>

        <button
          type="button"
          className="rt-color-action-row"
          onClick={() => colorInputRef.current?.click()}
        >
          <Palette />
          <span>Color picker</span>
          <input
            ref={colorInputRef}
            type="color"
            className="rt-color-input-hidden"
            onChange={(e) => palette.command(editor, e.target.value)}
          />
        </button>
      </PopoverContent>
    </Popover>
  );
}
