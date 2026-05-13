import type { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import { colorPalettes, getToolbarButtons, listItems } from "./definitions";
import type { ToolbarState } from "./types";

const emptyToolbarState: ToolbarState = {
  active: {},
  activeListId: undefined,
  characterCount: 0,
  disabled: {},
  currentBlockLabel: "Paragraph",
  currentFontSize: null,
};

export function useToolbarState(editor: Editor | null) {
  return (
    useEditorState({
      editor,
      selector: ({ editor }) => {
        if (!editor) {
          return emptyToolbarState;
        }

        const active: Record<string, boolean> = {};
        const disabled: Record<string, boolean> = {};

        for (const item of getToolbarButtons()) {
          active[item.id] = item.isActive?.(editor) ?? false;
          disabled[item.id] = item.isDisabled?.(editor) ?? false;
        }

        let activeListId: string | undefined;
        for (const item of listItems) {
          const isActive = item.isActive?.(editor) ?? false;
          active[item.id] = isActive;
          if (isActive) {
            activeListId = item.id;
          }
        }

        for (const palette of colorPalettes) {
          active[palette.id] = palette.isActive?.(editor) ?? false;
        }

        active.link = editor.isActive("link");

        const rawFontSize = editor.getAttributes("textStyle").fontSize as string | undefined;
        const currentFontSize = rawFontSize ? rawFontSize.replace("px", "") : null;

        return {
          active,
          activeListId,
          characterCount: getCharacterCount(editor),
          disabled,
          currentBlockLabel: getCurrentBlockLabel(editor),
          currentFontSize,
        };
      },
    }) ?? emptyToolbarState
  );
}

function getCharacterCount(editor: Editor) {
  const storage = editor.storage as Editor["storage"] & {
    characterCount?: {
      characters?: () => number;
    };
  };

  return storage.characterCount?.characters() ?? editor.getText().length;
}

function getCurrentBlockLabel(editor: Editor) {
  if (editor.isActive("heading", { level: 1 })) return "Heading 1";
  if (editor.isActive("heading", { level: 2 })) return "Heading 2";
  if (editor.isActive("heading", { level: 3 })) return "Heading 3";
  return "Paragraph";
}
