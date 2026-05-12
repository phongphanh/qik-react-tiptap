import type { Editor } from "@tiptap/core";
import type * as React from "react";
import { cn } from "../lib/utils";
import { Separator } from "../ui/separator";
import { TooltipProvider } from "../ui/tooltip";
import { BlockFormatMenu } from "./block-format-menu";
import { FontSizeMenu } from "./font-size-menu";
import { ColorPopover } from "./color-popover";
import { colorPalettes, toolbarGroups } from "./definitions";
import { ImagePopover } from "./image-popover";
import { LinkPopover } from "./link-popover";
import { TableInsertPopover } from "./table-insert-popover";
import { ListMenu } from "./list-menu";
import { ToolbarButton } from "./toolbar-button";
import type { ToolbarState } from "./types";

export interface EditorToolbarProps {
  className?: string;
  editor: Editor;
  state: ToolbarState;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  imageUrl: string;
  labels?: {
    linkPlaceholder?: string;
    imageUrlPlaceholder?: string;
  };
  onImageFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onImageUrlChange: (value: string) => void;
  onInsertImage: () => void;
}

export function EditorToolbar({
  className,
  editor,
  state,
  fileInputRef,
  imageUrl,
  labels,
  onImageFileChange,
  onImageUrlChange,
  onInsertImage,
}: EditorToolbarProps) {
  return (
    <TooltipProvider delayDuration={250}>
      <div
        className={cn("rt-toolbar", className)}
        role="toolbar"
        aria-label="Editor toolbar"
      >
        {toolbarGroups.map((group, index) => (
          <ToolbarGroup
            key={group.id}
            showSeparator={index > 0}
          >
            {group.id === "marks" && (
              <>
                <BlockFormatMenu
                  editor={editor}
                  currentBlockLabel={state.currentBlockLabel}
                />
                <FontSizeMenu
                  editor={editor}
                  currentFontSize={state.currentFontSize}
                />
                <Separator />
              </>
            )}

            {group.id === "blocks" && (
              <ListMenu
                activeListId={state.activeListId}
                editor={editor}
              />
            )}

            {group.items.map((item) => {
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

            {group.id === "marks" && (
              <>
                <Separator />
                {colorPalettes.map((palette) => (
                  <ColorPopover
                    key={palette.id}
                    active={state.active[palette.id]}
                    editor={editor}
                    palette={palette}
                  />
                ))}
              </>
            )}
          </ToolbarGroup>
        ))}

        <Separator />

        <LinkPopover
          active={state.active.link}
          editor={editor}
          placeholder={labels?.linkPlaceholder}
        />
        <ImagePopover
          fileInputRef={fileInputRef}
          imageUrl={imageUrl}
          placeholder={labels?.imageUrlPlaceholder}
          onImageFileChange={onImageFileChange}
          onImageUrlChange={onImageUrlChange}
          onInsertImage={onInsertImage}
        />
        <TableInsertPopover editor={editor} />
      </div>
    </TooltipProvider>
  );
}

function ToolbarGroup({
  children,
  showSeparator,
}: React.PropsWithChildren<{ showSeparator: boolean }>) {
  return (
    <>
      {showSeparator && <Separator />}
      {children}
    </>
  );
}
