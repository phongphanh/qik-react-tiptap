import type { Editor } from "@tiptap/core";
import { ChevronDown, List } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip";
import { listItems } from "./definitions";

export interface ListMenuProps {
  activeListId?: string;
  editor: Editor;
}

export function ListMenu({ activeListId, editor }: ListMenuProps) {
  const activeItem = listItems.find((item) => item.id === activeListId);
  const TriggerIcon = activeItem?.icon ?? List;

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              active={Boolean(activeItem)}
              aria-label={activeItem?.label ?? "List"}
              className="rt-dropdown-tool-trigger"
              onMouseDown={(event) => event.preventDefault()}
            >
              <TriggerIcon />
              <ChevronDown className="rt-trigger-chevron" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>{activeItem?.label ?? "List"}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent>
        {listItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeListId;

          return (
            <DropdownMenuItem
              key={item.id}
              className={isActive ? "rt-menu-item-active" : undefined}
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
