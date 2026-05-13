import type { Editor } from "@tiptap/core";
import { BubbleMenu } from "@tiptap/react/menus";
import * as React from "react";
import { getThemeAttribute, type SimpleEditorTheme } from "../theme";
import { Separator } from "../ui/separator";
import { TooltipProvider } from "../ui/tooltip";
import { ColorPopover } from "./color-popover";
import { colorPalettes, toolbarGroups } from "./definitions";
import { FontSizeMenu } from "./font-size-menu";
import { LinkPopover } from "./link-popover";
import { NodeSelector } from "./node-selector";
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

  // Notion-style popover coordination: only one panel open at a time.
  // When any panel opens it explicitly closes the others so the bubble menu
  // never shows two overlapping floating panels simultaneously.
  const [openPanel, setOpenPanel] = React.useState<string | null>(null);

  const makeHandler = (id: string) => (open: boolean) =>
    setOpenPanel((prev) => (open ? id : prev === id ? null : prev));

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
        updateDelay={60}
        resizeDelay={60}
        appendTo={() =>
          // Keep the toolbar DOM inside the editor shell so it participates in
          // the editor's stacking context and inherits its CSS custom properties.
          // position:fixed is immune to overflow:hidden on ancestors (no transform
          // on the shell), so the toolbar still positions correctly in the viewport.
          (editor.view.dom.closest(".rt-editor-shell") as HTMLElement | null) ??
          document.body
        }
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
          // absolute (not fixed) so the toolbar is positioned within the shell's
          // coordinate system — this makes overflow:hidden on the shell clip it
          // correctly. With fixed the element escapes overflow:hidden entirely.
          strategy: "absolute",
          placement: "top",
          offset: 10,
          flip: { padding: 8, fallbackPlacements: ["bottom"] },
          shift: { padding: 8 },
          inline: true,
          hide: true,
          scrollTarget,
        }}
      >
        {/* Unified "Turn into" selector — paragraph, headings, lists, quote, code
            block in one dropdown. Each command calls clearNodes() first so any
            block type converts cleanly into any other (Notion-style). */}
        <NodeSelector
          editor={editor}
          open={openPanel === "node"}
          onOpenChange={makeHandler("node")}
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
            open={openPanel === palette.id}
            onOpenChange={makeHandler(palette.id)}
          />
        ))}

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
          open={openPanel === "link"}
          onOpenChange={makeHandler("link")}
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
