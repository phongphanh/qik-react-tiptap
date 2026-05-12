import type { Editor } from "@tiptap/core";
import * as React from "react";
import { selectClickedLink } from "../editor/link-events";
import { isToolbarInteractionTarget } from "./dom";

export interface LinkToolbarState {
  href: string;
  left: number;
  top: number;
}

export function useLinkToolbar(editor: Editor | null) {
  const [state, setState] = React.useState<LinkToolbarState | null>(null);

  React.useEffect(() => {
    if (!editor) {
      setState(null);
      return;
    }

    const editorElement = editor.view.dom;

    const openForSelection = () => {
      const href = editor.getAttributes("link").href;

      if (!href || !editor.isActive("link")) {
        setState(null);
        return;
      }

      const { from, to } = editor.state.selection;
      const start = editor.view.coordsAtPos(from);
      const end = editor.view.coordsAtPos(to);

      setState({
        href,
        left: (start.left + end.right) / 2,
        top: Math.min(start.top, end.top),
      });
    };

    const handleClick = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const link = target.closest("a[href]");

      if (!(link instanceof HTMLAnchorElement)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      selectClickedLink(editor, event);

      const rect = link.getBoundingClientRect();
      setState({
        href: link.href,
        left: rect.left + rect.width / 2,
        top: rect.top,
      });
    };

    const hideWhenClickingOutside = (event: PointerEvent) => {
      if (isToolbarInteractionTarget(event.target)) {
        return;
      }

      setState(null);
    };

    editorElement.addEventListener("click", handleClick, true);
    editor.on("selectionUpdate", openForSelection);
    document.addEventListener("pointerdown", hideWhenClickingOutside, true);

    return () => {
      editorElement.removeEventListener("click", handleClick, true);
      editor.off("selectionUpdate", openForSelection);
      document.removeEventListener("pointerdown", hideWhenClickingOutside, true);
    };
  }, [editor]);

  return [state, setState] as const;
}
