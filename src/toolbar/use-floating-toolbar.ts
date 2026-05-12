import type { Editor } from "@tiptap/core";
import * as React from "react";
import { isToolbarInteractionTarget } from "./dom";

export interface FloatingToolbarPosition {
  left: number;
  top: number;
}

export function useFloatingToolbar(editor: Editor | null) {
  const [position, setPosition] = React.useState<FloatingToolbarPosition | null>(
    null,
  );
  const dismissedSelectionRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!editor) {
      setPosition(null);
      return;
    }

    const update = () => {
      const { from, to, empty } = editor.state.selection;
      const selectionKey = `${from}:${to}`;

      if (
        empty ||
        !editor.isEditable ||
        editor.state.selection.constructor.name === "NodeSelection"
      ) {
        setPosition(null);
        return;
      }

      const selectedText = editor.state.doc.textBetween(from, to, "\n").trim();

      if (!selectedText) {
        setPosition(null);
        return;
      }

      if (dismissedSelectionRef.current === selectionKey) {
        setPosition(null);
        return;
      }

      const start = editor.view.coordsAtPos(from);
      const end = editor.view.coordsAtPos(to);

      setPosition({
        left: (start.left + end.right) / 2,
        top: Math.min(start.top, end.top),
      });
    };

    const hideWhenClickingOutside = (event: PointerEvent) => {
      if (isToolbarInteractionTarget(event.target)) {
        return;
      }

      const { from, to } = editor.state.selection;
      dismissedSelectionRef.current = `${from}:${to}`;
      setPosition(null);
    };

    update();
    editor.on("selectionUpdate", update);
    editor.on("transaction", update);
    editor.on("focus", update);
    document.addEventListener("pointerdown", hideWhenClickingOutside, true);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    return () => {
      editor.off("selectionUpdate", update);
      editor.off("transaction", update);
      editor.off("focus", update);
      document.removeEventListener("pointerdown", hideWhenClickingOutside, true);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [editor]);

  return position;
}
