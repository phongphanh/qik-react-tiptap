import type { Editor } from "@tiptap/core";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Merge,
  Rows2,
  Columns2,
  Split,
  Trash2,
} from "lucide-react";
import * as React from "react";
import { Separator } from "../ui/separator";
import { TooltipProvider } from "../ui/tooltip";
import { ToolbarButton } from "./toolbar-button";
import type { TableToolbarState } from "./use-table-toolbar";

interface TableToolbarProps {
  editor: Editor;
  state: TableToolbarState | null;
}

export function TableToolbar({ editor, state }: TableToolbarProps) {
  const toolbarRef = React.useRef<HTMLDivElement>(null);
  const [toolbarWidth, setToolbarWidth] = React.useState(480);

  React.useLayoutEffect(() => {
    if (state && toolbarRef.current) {
      setToolbarWidth(toolbarRef.current.getBoundingClientRect().width);
    }
  }, [state]);

  if (!state) return null;

  const clampedLeft = Math.min(
    Math.max(state.left, toolbarWidth / 2 + 8),
    window.innerWidth - toolbarWidth / 2 - 8,
  );
  const hasRoomAbove = state.top - 54 > 8;
  const top = hasRoomAbove ? state.top : state.bottom;

  return (
    <TooltipProvider delayDuration={250}>
      <div
        ref={toolbarRef}
        className="rt-table-toolbar"
        data-side={hasRoomAbove ? "top" : "bottom"}
        style={{ left: clampedLeft, top }}
        onMouseDown={(e) => e.preventDefault()}
      >
        <ToolbarButton
          label="Add row above"
          onClick={() => editor.chain().focus().addRowBefore().run()}
        >
          <span className="rt-table-toolbar-icon-stack">
            <Rows2 />
            <ArrowUp className="rt-table-toolbar-badge" />
          </span>
        </ToolbarButton>
        <ToolbarButton
          label="Add row below"
          onClick={() => editor.chain().focus().addRowAfter().run()}
        >
          <span className="rt-table-toolbar-icon-stack">
            <Rows2 />
            <ArrowDown className="rt-table-toolbar-badge" />
          </span>
        </ToolbarButton>
        <ToolbarButton
          label="Delete row"
          onClick={() => editor.chain().focus().deleteRow().run()}
        >
          <span className="rt-table-toolbar-icon-stack">
            <Rows2 />
            <Trash2 className="rt-table-toolbar-badge" />
          </span>
        </ToolbarButton>

        <Separator />

        <ToolbarButton
          label="Add column left"
          onClick={() => editor.chain().focus().addColumnBefore().run()}
        >
          <span className="rt-table-toolbar-icon-stack">
            <Columns2 />
            <ArrowLeft className="rt-table-toolbar-badge" />
          </span>
        </ToolbarButton>
        <ToolbarButton
          label="Add column right"
          onClick={() => editor.chain().focus().addColumnAfter().run()}
        >
          <span className="rt-table-toolbar-icon-stack">
            <Columns2 />
            <ArrowRight className="rt-table-toolbar-badge" />
          </span>
        </ToolbarButton>
        <ToolbarButton
          label="Delete column"
          onClick={() => editor.chain().focus().deleteColumn().run()}
        >
          <span className="rt-table-toolbar-icon-stack">
            <Columns2 />
            <Trash2 className="rt-table-toolbar-badge" />
          </span>
        </ToolbarButton>

        <Separator />

        <ToolbarButton
          label="Merge cells"
          disabled={!state.canMergeCells}
          onClick={() => editor.chain().focus().mergeCells().run()}
        >
          <Merge />
        </ToolbarButton>
        <ToolbarButton
          label="Split cell"
          disabled={!state.canSplitCell}
          onClick={() => editor.chain().focus().splitCell().run()}
        >
          <Split />
        </ToolbarButton>

        <Separator />

        <ToolbarButton
          label="Delete table"
          onClick={() => editor.chain().focus().deleteTable().run()}
        >
          <Trash2 />
        </ToolbarButton>
      </div>
    </TooltipProvider>
  );
}
