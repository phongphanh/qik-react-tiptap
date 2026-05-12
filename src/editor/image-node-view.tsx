import * as React from "react";
import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/core";
import { AlignCenter, AlignLeft, AlignRight, Trash2 } from "lucide-react";
import { Separator } from "../ui/separator";
import { TooltipProvider } from "../ui/tooltip";
import { ToolbarButton } from "../toolbar/toolbar-button";

interface ToolbarPos {
  centerX: number;
  top: number;
  bottom: number;
}

export function ImageNodeView({
  node,
  selected,
  updateAttributes,
  editor,
  deleteNode,
}: NodeViewProps) {
  const { src, alt, title, width, align } = node.attrs as {
    src: string;
    alt?: string;
    title?: string;
    width?: number | null;
    align?: string;
  };

  const containerRef = React.useRef<HTMLDivElement>(null);
  const imgRef = React.useRef<HTMLImageElement>(null);
  const toolbarRef = React.useRef<HTMLDivElement>(null);
  const [toolbarPos, setToolbarPos] = React.useState<ToolbarPos | null>(null);
  const [toolbarWidth, setToolbarWidth] = React.useState(200);

  const updatePos = React.useCallback(() => {
    if (!selected || !containerRef.current) {
      setToolbarPos(null);
      return;
    }
    const rect = containerRef.current.getBoundingClientRect();
    setToolbarPos({ centerX: rect.left + rect.width / 2, top: rect.top, bottom: rect.bottom });
  }, [selected]);

  React.useLayoutEffect(() => {
    updatePos();
    if (!selected) return;
    window.addEventListener("resize", updatePos);
    window.addEventListener("scroll", updatePos, true);
    return () => {
      window.removeEventListener("resize", updatePos);
      window.removeEventListener("scroll", updatePos, true);
    };
  }, [selected, updatePos]);

  React.useLayoutEffect(() => {
    if (toolbarPos && toolbarRef.current) {
      setToolbarWidth(toolbarRef.current.getBoundingClientRect().width);
    }
  }, [toolbarPos]);

  const handleResizeMouseDown = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = imgRef.current?.offsetWidth ?? 200;

      const onMouseMove = (moveEvent: MouseEvent) => {
        const newWidth = Math.max(50, startWidth + (moveEvent.clientX - startX));
        updateAttributes({ width: Math.round(newWidth) });
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [updateAttributes],
  );

  const clampedLeft = toolbarPos
    ? Math.min(
        Math.max(toolbarPos.centerX, toolbarWidth / 2 + 8),
        window.innerWidth - toolbarWidth / 2 - 8,
      )
    : 0;
  const hasRoomAbove = toolbarPos ? toolbarPos.top - 54 > 8 : true;
  const toolbarTop = toolbarPos ? (hasRoomAbove ? toolbarPos.top : toolbarPos.bottom) : 0;

  return (
    <NodeViewWrapper as="div" className="rt-image-wrapper" data-align={align ?? "center"}>
      <div ref={containerRef} className="rt-image-container">
        <img
          ref={imgRef}
          src={src}
          alt={alt ?? ""}
          title={title ?? undefined}
          style={width ? { width: `${width}px` } : undefined}
          draggable={false}
          data-selected={selected ? "" : undefined}
        />
        {editor.isEditable && (
          <div className="rt-image-resize-handle" onMouseDown={handleResizeMouseDown} />
        )}
      </div>

      {toolbarPos && editor.isEditable && (
        <TooltipProvider delayDuration={250}>
          <div
            ref={toolbarRef}
            className="rt-image-toolbar"
            data-side={hasRoomAbove ? "top" : "bottom"}
            style={{ left: clampedLeft, top: toolbarTop }}
            onMouseDown={(e) => e.preventDefault()}
          >
            <ToolbarButton
              label="Align left"
              active={align === "left"}
              onClick={() => updateAttributes({ align: "left" })}
            >
              <AlignLeft />
            </ToolbarButton>
            <ToolbarButton
              label="Align center"
              active={!align || align === "center"}
              onClick={() => updateAttributes({ align: "center" })}
            >
              <AlignCenter />
            </ToolbarButton>
            <ToolbarButton
              label="Align right"
              active={align === "right"}
              onClick={() => updateAttributes({ align: "right" })}
            >
              <AlignRight />
            </ToolbarButton>
            <Separator />
            <ToolbarButton label="Delete image" onClick={() => deleteNode()}>
              <Trash2 />
            </ToolbarButton>
          </div>
        </TooltipProvider>
      )}
    </NodeViewWrapper>
  );
}
