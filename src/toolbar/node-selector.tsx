import type { Editor } from "@tiptap/core";
import {
  CheckSquare,
  ChevronDown,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
} from "lucide-react";
import * as React from "react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface NodeItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  // Uses clearNodes() first so any block type converts cleanly into any other
  // (Notion-style "Turn into" — avoids nesting issues like list-inside-heading)
  command: (editor: Editor) => void;
  isActive: (editor: Editor) => boolean;
}

const NODE_ITEMS: NodeItem[] = [
  {
    id: "paragraph",
    label: "Paragraph",
    icon: Pilcrow,
    command: (e) => e.chain().focus().clearNodes().run(),
    isActive: (e) =>
      e.isActive("paragraph") &&
      !e.isActive("bulletList") &&
      !e.isActive("orderedList") &&
      !e.isActive("taskList"),
  },
  {
    id: "heading-1",
    label: "Heading 1",
    icon: Heading1,
    command: (e) => e.chain().focus().clearNodes().toggleHeading({ level: 1 }).run(),
    isActive: (e) => e.isActive("heading", { level: 1 }),
  },
  {
    id: "heading-2",
    label: "Heading 2",
    icon: Heading2,
    command: (e) => e.chain().focus().clearNodes().toggleHeading({ level: 2 }).run(),
    isActive: (e) => e.isActive("heading", { level: 2 }),
  },
  {
    id: "heading-3",
    label: "Heading 3",
    icon: Heading3,
    command: (e) => e.chain().focus().clearNodes().toggleHeading({ level: 3 }).run(),
    isActive: (e) => e.isActive("heading", { level: 3 }),
  },
  {
    id: "bullet-list",
    label: "Bullet List",
    icon: List,
    command: (e) => e.chain().focus().clearNodes().toggleBulletList().run(),
    isActive: (e) => e.isActive("bulletList"),
  },
  {
    id: "ordered-list",
    label: "Numbered List",
    icon: ListOrdered,
    command: (e) => e.chain().focus().clearNodes().toggleOrderedList().run(),
    isActive: (e) => e.isActive("orderedList"),
  },
  {
    id: "task-list",
    label: "Task List",
    icon: CheckSquare,
    command: (e) => e.chain().focus().clearNodes().toggleTaskList().run(),
    isActive: (e) => e.isActive("taskList"),
  },
  {
    id: "blockquote",
    label: "Quote",
    icon: Quote,
    command: (e) => e.chain().focus().clearNodes().toggleBlockquote().run(),
    isActive: (e) => e.isActive("blockquote"),
  },
  {
    id: "code-block",
    label: "Code Block",
    icon: Code,
    command: (e) => e.chain().focus().clearNodes().toggleCodeBlock().run(),
    isActive: (e) => e.isActive("codeBlock"),
  },
];

function getActiveItem(editor: Editor): NodeItem {
  return NODE_ITEMS.find((item) => item.isActive(editor)) ?? NODE_ITEMS[0];
}

export interface NodeSelectorProps {
  editor: Editor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NodeSelector({ editor, open, onOpenChange }: NodeSelectorProps) {
  const activeItem = getActiveItem(editor);
  const Icon = activeItem.icon;

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          size="md"
          variant="outline"
          className="rt-format-trigger"
          onMouseDown={(e) => e.preventDefault()}
        >
          <Icon />
          {activeItem.label}
          <ChevronDown className="rt-trigger-chevron" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {NODE_ITEMS.map((item) => {
          const ItemIcon = item.icon;
          const isActive = item.isActive(editor);

          return (
            <DropdownMenuItem
              key={item.id}
              className={isActive ? "rt-menu-item-active" : undefined}
              onSelect={() => item.command(editor)}
            >
              <ItemIcon />
              <span>{item.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
