import type { Editor } from "@tiptap/core";
import { ExternalLink, Link2Off } from "lucide-react";
import * as React from "react";
import { Button } from "../ui/button";
import { TooltipProvider } from "../ui/tooltip";
import { LinkPopover } from "./link-popover";
import type { LinkToolbarState } from "./use-link-toolbar";

export interface LinkToolbarProps {
  onOpenChange?: (open: boolean) => void;
  editor: Editor;
  placeholder?: string;
  state: LinkToolbarState | null;
}

export function LinkToolbar({
  editor,
  onOpenChange,
  placeholder,
  state,
}: LinkToolbarProps) {
  const toolbarRef = React.useRef<HTMLDivElement>(null);
  const [measuredWidth, setMeasuredWidth] = React.useState(280);

  React.useLayoutEffect(() => {
    if (!state || !toolbarRef.current) return;
    setMeasuredWidth(toolbarRef.current.getBoundingClientRect().width);
  }, [state]);

  if (!state) {
    return null;
  }

  const left = clamp(
    state.left,
    measuredWidth / 2 + 8,
    window.innerWidth - measuredWidth / 2 - 8,
  );

  return (
    <TooltipProvider delayDuration={250}>
      <div
        ref={toolbarRef}
        className="rt-link-toolbar"
        style={{
          left,
          top: state.top,
        }}
        onMouseDown={(event) => event.preventDefault()}
      >
        <button
          type="button"
          className="rt-link-toolbar-url"
          title={state.href}
          onClick={(event) => {
            event.preventDefault();
            editor.chain().focus().extendMarkRange("link").run();
          }}
        >
          {state.href}
        </button>
        <Button
          aria-label="Open link"
          onClick={() => window.open(state.href, "_blank", "noopener,noreferrer")}
        >
          <ExternalLink />
        </Button>
        <LinkPopover active urlOnly editor={editor} placeholder={placeholder} />
        <Button
          aria-label="Remove link"
          onClick={() => {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            onOpenChange?.(false);
          }}
        >
          <Link2Off />
        </Button>
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
