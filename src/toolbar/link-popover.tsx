import type { Editor } from "@tiptap/core";
import { LinkIcon } from "lucide-react";
import * as React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip";

export interface LinkPopoverProps {
  active?: boolean;
  editor: Editor;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
  textPlaceholder?: string;
  urlOnly?: boolean;
}

export function LinkPopover({
  active,
  editor,
  open,
  onOpenChange,
  placeholder,
  textPlaceholder,
  urlOnly,
}: LinkPopoverProps) {
  const [text, setText] = React.useState("");
  const [url, setUrl] = React.useState("");

  const syncFields = React.useCallback(() => {
    const { from, to, empty } = editor.state.selection;

    setText(empty ? "" : editor.state.doc.textBetween(from, to, " "));
    setUrl(editor.getAttributes("link").href ?? "");
  }, [editor]);

  const applyLink = React.useCallback(() => {
    const href = url.trim();

    if (!href) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    if (urlOnly) {
      editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
      return;
    }

    const label = text.trim();
    const { from, to, empty } = editor.state.selection;
    const range = active
      ? getExtendedLinkRange(editor)
      : empty
        ? { from, to }
        : { from, to };
    const nextText = label || editor.state.doc.textBetween(range.from, range.to, " ") || href;

    editor
      .chain()
      .focus()
      .insertContentAt(range, nextText)
      .setTextSelection({
        from: range.from,
        to: range.from + nextText.length,
      })
      .setLink({ href })
      .run();
  }, [active, editor, text, url, urlOnly]);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) syncFields();
        onOpenChange?.(next);
      }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              active={active}
              aria-label="Link"
              onMouseDown={(event) => event.preventDefault()}
            >
              <LinkIcon />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Link</TooltipContent>
      </Tooltip>
      <PopoverContent className="rt-link-popover">
        {!urlOnly && (
          <label className="rt-field">
            <span>Text</span>
            <Input
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder={textPlaceholder ?? "Link text"}
            />
          </label>
        )}
        <label className="rt-field">
          <span>URL</span>
          <Input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder={placeholder ?? "https://example.com"}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                applyLink();
              }
            }}
          />
        </label>
        <Button size="sm" variant="default" onClick={applyLink}>
          Apply
        </Button>
      </PopoverContent>
    </Popover>
  );
}

function getExtendedLinkRange(editor: Editor) {
  const { from, to } = editor.state.selection;
  const markType = editor.schema.marks.link;
  const $pos = editor.state.doc.resolve(from);
  const parent = $pos.parent;
  const parentStart = $pos.start();
  let start = from;
  let end = to;

  parent.forEach((node, offset) => {
    const nodeStart = parentStart + offset;
    const nodeEnd = nodeStart + node.nodeSize;
    const hasLink = markType && markType.isInSet(node.marks);

    if (!hasLink || nodeEnd < from || nodeStart > to) {
      return;
    }

    start = Math.min(start, nodeStart);
    end = Math.max(end, nodeEnd);
  });

  return { from: start, to: end };
}
