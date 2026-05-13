import type { Editor } from "@tiptap/core";
import { BubbleMenu } from "@tiptap/react/menus";
import * as React from "react";
import { getThemeAttribute, type SimpleEditorTheme } from "../theme";
import { Separator } from "../ui/separator";
import { TooltipProvider } from "../ui/tooltip";
import { BlockFormatMenu } from "./block-format-menu";
import { ColorPopover } from "./color-popover";
import { colorPalettes, toolbarGroups } from "./definitions";
import { FontSizeMenu } from "./font-size-menu";
import { LinkPopover } from "./link-popover";
import { ListMenu } from "./list-menu";
import { ToolbarButton } from "./toolbar-button";
import type { ToolbarState } from "./types";

export interface FloatingToolbarProps {
  disabled?: boolean;
  editor: Editor;
  labels?: {
    linkPlaceholder?: string;
  };
  state: ToolbarState;
  theme?: SimpleEditorTheme;
}

export function FloatingToolbar({
  disabled = false,
  editor,
  labels,
  state,
  theme = "system",
}: FloatingToolbarProps) {
  const scrollContainer = editor.view.dom.closest(".rt-editor-content") as HTMLElement | null;
  const scrollTarget = scrollContainer ?? window;

  // Tiptap's built-in scroll listener debounces updatePosition by `resizeDelay`
  // (same handler as window resize), so the menu only repositions after scrolling
  // stops. We register our own rAF-throttled listener to force an updatePosition
  // dispatch on every animation frame during scroll.
  React.useEffect(() => {
    if (!scrollContainer) return;

    let rafId: number | null = null;

    const onScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (!editor.isDestroyed) {
          editor.view.dispatch(
            editor.state.tr.setMeta("rt-text-bubble-menu", "updatePosition"),
          );
        }
      });
    };

    scrollContainer.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      scrollContainer.removeEventListener("scroll", onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [editor, scrollContainer]);

  return (
    <TooltipProvider delayDuration={250}>
      <BubbleMenu
        editor={editor}
        pluginKey="rt-text-bubble-menu"
        className="rt-floating-toolbar"
        role="toolbar"
        aria-label="Floating editor toolbar"
        data-rt-theme={getThemeAttribute(theme)}
        updateDelay={60}
        resizeDelay={60}
        appendTo={() => document.body}
        shouldShow={({ editor, state, from, to }) => {
          if (disabled || !editor.isEditable || state.selection.empty) {
            return false;
          }

          if (state.selection.constructor.name === "NodeSelection") {
            return false;
          }

          // Don't show inside code blocks — marks like color/font-size don't apply
          if (editor.isActive("codeBlock")) {
            return false;
          }

          return state.doc.textBetween(from, to, "\n").trim().length > 0;
        }}
        options={{
          strategy: "fixed",
          placement: "top",
          offset: 10,
          flip: { padding: 8, fallbackPlacements: ["bottom"] },
          shift: { padding: 8 },
          inline: true,
          hide: true,
          scrollTarget,
        }}
      >
        <BlockFormatMenu
          editor={editor}
          currentBlockLabel={state.currentBlockLabel}
        />
        <FontSizeMenu
          editor={editor}
          currentFontSize={state.currentFontSize}
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
      </BubbleMenu>
    </TooltipProvider>
  );
}
