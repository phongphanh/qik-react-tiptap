import type { Editor } from "@tiptap/core";
import { ChevronDown } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const FONT_SIZES = ["10", "12", "14", "16", "18", "20", "24", "28", "32", "36", "48", "72"];

export interface FontSizeMenuProps {
  currentFontSize: string | null;
  editor: Editor;
}

export function FontSizeMenu({ currentFontSize, editor }: FontSizeMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="md"
          variant="outline"
          className="rt-font-size-trigger"
          onMouseDown={(event) => event.preventDefault()}
        >
          {currentFontSize ?? "—"}
          <ChevronDown className="rt-trigger-chevron" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Font size</DropdownMenuLabel>
        <DropdownMenuItem
          className={!currentFontSize ? "rt-menu-item-active" : undefined}
          onSelect={() => editor.chain().focus().unsetFontSize().run()}
        >
          Default
        </DropdownMenuItem>
        {FONT_SIZES.map((size) => (
          <DropdownMenuItem
            key={size}
            className={currentFontSize === size ? "rt-menu-item-active" : undefined}
            onSelect={() => editor.chain().focus().setFontSize(size).run()}
          >
            {size}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
