import { CharacterCount } from "@tiptap/extension-character-count";
import { Highlight } from "@tiptap/extension-highlight";
import { Link } from "@tiptap/extension-link";
import { TableKit } from "@tiptap/extension-table";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import { Underline } from "@tiptap/extension-underline";
import { StarterKit } from "@tiptap/starter-kit";
import { EnhancedImage } from "./image-extension";
import { FontSize } from "./font-size";
import { Indent } from "./indent";
import { PasteNormalizer } from "./paste-normalizer";

export interface CreateSimpleEditorExtensionsOptions {
  characterLimit?: number | null;
  placeholder?: string;
}

export function createSimpleEditorExtensions({
  characterLimit = null,
  placeholder = "Write something...",
}: CreateSimpleEditorExtensionsOptions = {}) {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
    }),
    Underline,
    TextStyle,
    Color,
    FontSize,
    Indent,
    PasteNormalizer,
    CharacterCount.configure({ limit: characterLimit }),
    Highlight.configure({ multicolor: true }),
    Link.configure({
      openOnClick: false,
      autolink: true,
      defaultProtocol: "https",
      HTMLAttributes: {
        target: null,
      },
    }),
    EnhancedImage.configure({
      allowBase64: true,
    }),
    TableKit.configure({
      table: { resizable: true },
      tableCell: {},
      tableHeader: {},
      tableRow: {},
    }),
    TaskList,
    TaskItem.configure({ nested: true }),
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Placeholder.configure({ placeholder }),
  ];
}
