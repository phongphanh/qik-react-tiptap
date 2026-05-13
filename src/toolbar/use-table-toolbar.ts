import type { Editor } from "@tiptap/core";
import * as React from "react";
import { isToolbarInteractionTarget } from "./dom";

export interface TableToolbarState {
  left: number;
  top: number;
  bottom: number;
  canMergeCells: boolean;
  canSplitCell: boolean;
}

function getTableWrapperRect(editor: Editor): DOMRect | null {
  const { from } = editor.state.selection;
  const resolved = editor.state.doc.resolve(from);
  for (let depth = resolved.depth; depth > 0; depth--) {
    const node = resolved.node(depth);
    if (node.type.name === "table") {
      const tablePos = resolved.before(depth);
      const tableDOM = editor.view.nodeDOM(tablePos) as HTMLElement | null;
      if (!tableDOM) return null;
      const wrapper = (tableDOM.closest(".tableWrapper") ?? tableDOM) as HTMLElement;
      return wrapper.getBoundingClientRect();
    }
  }
  return null;
}

export function useTableToolbar(editor: Editor | null) {
  const [state, setState] = React.useState<TableToolbarState | null>(null);

  React.useEffect(() => {
    if (!editor) {
      setState(null);
      return;
    }

    const update = () => {
      if (!editor.isActive("table") || !editor.isEditable) {
        setState(null);
        return;
      }
      const rect = getTableWrapperRect(editor);
      if (!rect) {
        setState(null);
        return;
      }
      const left = rect.left + rect.width / 2;
      const { top, bottom } = rect;
      const canMergeCells = editor.can().mergeCells();
      const canSplitCell = editor.can().splitCell();

      setState((prev) => {
        if (
          prev &&
          prev.left === left &&
          prev.top === top &&
          prev.bottom === bottom &&
          prev.canMergeCells === canMergeCells &&
          prev.canSplitCell === canSplitCell
        ) {
          return prev; // same reference → no re-render
        }
        return { left, top, bottom, canMergeCells, canSplitCell };
      });
    };

    const hideOnOutsideClick = (event: PointerEvent) => {
      if (isToolbarInteractionTarget(event.target)) return;
      const target = event.target;
      if (target instanceof Element && target.closest(".tableWrapper, table")) return;
      setState(null);
    };

    editor.on("selectionUpdate", update);
    // Skip pure-meta transactions (e.g. bubble-menu position pings) that
    // never affect table geometry or merge capabilities.
    editor.on("transaction", ({ transaction: tr }) => {
      if (tr.docChanged || tr.selectionSet) update();
    });
    editor.on("focus", update);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    document.addEventListener("pointerdown", hideOnOutsideClick, true);

    return () => {
      editor.off("selectionUpdate", update);
      editor.off("transaction", update);
      editor.off("focus", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      document.removeEventListener("pointerdown", hideOnOutsideClick, true);
    };
  }, [editor]);

  return state;
}
