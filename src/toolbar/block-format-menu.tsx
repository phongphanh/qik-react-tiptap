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
import { blockItems } from "./definitions";

export interface BlockFormatMenuProps {
  editor: Editor;
  currentBlockLabel: string;
}

export function BlockFormatMenu({
  editor,
  currentBlockLabel,
}: BlockFormatMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="md"
          variant="outline"
          className="rt-format-trigger"
          onMouseDown={(event) => event.preventDefault()}
        >
          {currentBlockLabel}
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Format</DropdownMenuLabel>
        {blockItems.map((item) => {
          const Icon = item.icon;

          return (
            <DropdownMenuItem
              key={item.id}
              onSelect={() => item.command(editor)}
            >
              <Icon />
              <span>{item.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
