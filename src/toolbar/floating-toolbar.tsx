import type { Editor } from "@tiptap/core";
import * as React from "react";
import { Separator } from "../ui/separator";
import { TooltipProvider } from "../ui/tooltip";
import { BlockFormatMenu } from "./block-format-menu";
import { ColorPopover } from "./color-popover";
import { colorPalettes, toolbarGroups } from "./definitions";
import { LinkPopover } from "./link-popover";
import { ListMenu } from "./list-menu";
import { ToolbarButton } from "./toolbar-button";
import type { FloatingToolbarPosition } from "./use-floating-toolbar";
import type { ToolbarState } from "./types";

export interface FloatingToolbarProps {
  editor: Editor;
  labels?: {
    linkPlaceholder?: string;
  };
  position: FloatingToolbarPosition | null;
  state: ToolbarState;
}

export function FloatingToolbar({
  editor,
  labels,
  position,
  state,
}: FloatingToolbarProps) {
  const toolbarRef = React.useRef<HTMLDivElement>(null);
  const [measuredSize, setMeasuredSize] = React.useState({
    height: 44,
    width: 520,
  });

  React.useLayoutEffect(() => {
    if (!position || !toolbarRef.current) {
      return;
    }

    const rect = toolbarRef.current.getBoundingClientRect();
    setMeasuredSize({
      height: rect.height,
      width: rect.width,
    });
  }, [position]);

  if (!position) {
    return null;
  }

  const left = clamp(position.left, measuredSize.width / 2 + 8, window.innerWidth - measuredSize.width / 2 - 8);
  const hasRoomAbove = position.top - measuredSize.height - 10 > 8;
  const top = hasRoomAbove ? position.top : position.top + 28;

  return (
    <TooltipProvider delayDuration={250}>
      <div
        ref={toolbarRef}
        className="rt-floating-toolbar"
        role="toolbar"
        aria-label="Floating editor toolbar"
        data-side={hasRoomAbove ? "top" : "bottom"}
        style={{
          left,
          top,
        }}
      >
        <BlockFormatMenu
          editor={editor}
          currentBlockLabel={state.currentBlockLabel}
        />
        <Separator />

        {toolbarGroups
          .find((group) => group.id === "marks")
          ?.items.map((item) => {
            const Icon = item.icon;

            return (
              <ToolbarButton
                key={item.id}
                label={item.label}
                active={state.active[item.id]}
                disabled={state.disabled[item.id]}
                onClick={() => item.command(editor)}
              >
                <Icon />
              </ToolbarButton>
            );
          })}

        <Separator />

        {colorPalettes.map((palette) => (
          <ColorPopover
            key={palette.id}
            active={state.active[palette.id]}
            editor={editor}
            palette={palette}
          />
        ))}

        <Separator />

        <ListMenu activeListId={state.activeListId} editor={editor} />

        {toolbarGroups
          .find((group) => group.id === "blocks")
          ?.items.map((item) => {
            const Icon = item.icon;

            return (
              <ToolbarButton
                key={item.id}
                label={item.label}
                active={state.active[item.id]}
                disabled={state.disabled[item.id]}
                onClick={() => item.command(editor)}
              >
                <Icon />
              </ToolbarButton>
            );
          })}

        <Separator />

        {toolbarGroups
          .find((group) => group.id === "alignment")
          ?.items.map((item) => {
            const Icon = item.icon;

            return (
              <ToolbarButton
                key={item.id}
                label={item.label}
                active={state.active[item.id]}
                disabled={state.disabled[item.id]}
                onClick={() => item.command(editor)}
              >
                <Icon />
              </ToolbarButton>
            );
          })}

        <Separator />

        <LinkPopover
          active={state.active.link}
          editor={editor}
          placeholder={labels?.linkPlaceholder}
        />

        {toolbarGroups
          .find((group) => group.id === "cleanup")
          ?.items.map((item) => {
            const Icon = item.icon;

            return (
              <ToolbarButton
                key={item.id}
                label={item.label}
                active={state.active[item.id]}
                disabled={state.disabled[item.id]}
                onClick={() => item.command(editor)}
              >
                <Icon />
              </ToolbarButton>
            );
          })}
      </div>
    </TooltipProvider>
  );
}

function clamp(value: number, min: number, max: number) {
  if (max < min) {
    return Math.min(Math.max(value, 8), window.innerWidth - 8);
  }

  return Math.min(Math.max(value, min), max);
}
