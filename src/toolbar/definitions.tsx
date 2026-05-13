import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  CheckSquare,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  IndentDecrease,
  IndentIncrease,
  Italic,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react";
import type {
  ColorPaletteDefinition,
  ToolbarButtonDefinition,
  ToolbarDropdownItem,
  ToolbarGroupDefinition,
} from "./types";
import { toggleList } from "./list-commands";

export const blockItems: ToolbarDropdownItem[] = [
  {
    id: "paragraph",
    label: "Paragraph",
    icon: Pilcrow,
    command: (editor) => editor.chain().focus().setParagraph().run(),
  },
  {
    id: "heading-1",
    label: "Heading 1",
    icon: Heading1,
    command: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    id: "heading-2",
    label: "Heading 2",
    icon: Heading2,
    command: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    id: "heading-3",
    label: "Heading 3",
    icon: Heading3,
    command: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
];

export const listItems: ToolbarDropdownItem[] = [
  {
    id: "bullet-list",
    label: "Bullet List",
    icon: List,
    command: (editor) => toggleList(editor, "bullet"),
    isActive: (editor) => editor.isActive("bulletList"),
  },
  {
    id: "ordered-list",
    label: "Ordered List",
    icon: ListOrdered,
    command: (editor) => toggleList(editor, "ordered"),
    isActive: (editor) => editor.isActive("orderedList"),
  },
  {
    id: "task-list",
    label: "Task List",
    icon: CheckSquare,
    command: (editor) => toggleList(editor, "task"),
    isActive: (editor) => editor.isActive("taskList"),
  },
];

export const toolbarGroups: ToolbarGroupDefinition[] = [
  {
    id: "history",
    items: [
      {
        id: "undo",
        label: "Undo",
        icon: Undo2,
        command: (editor) => editor.chain().focus().undo().run(),
        isDisabled: (editor) => !editor.can().undo(),
      },
      {
        id: "redo",
        label: "Redo",
        icon: Redo2,
        command: (editor) => editor.chain().focus().redo().run(),
        isDisabled: (editor) => !editor.can().redo(),
      },
    ],
  },
  {
    id: "marks",
    items: [
      {
        id: "bold",
        label: "Bold",
        icon: Bold,
        command: (editor) => editor.chain().focus().toggleBold().run(),
        isActive: (editor) => editor.isActive("bold"),
      },
      {
        id: "italic",
        label: "Italic",
        icon: Italic,
        command: (editor) => editor.chain().focus().toggleItalic().run(),
        isActive: (editor) => editor.isActive("italic"),
      },
      {
        id: "underline",
        label: "Underline",
        icon: Underline,
        command: (editor) => editor.chain().focus().toggleUnderline().run(),
        isActive: (editor) => editor.isActive("underline"),
      },
      {
        id: "strike",
        label: "Strikethrough",
        icon: Strikethrough,
        command: (editor) => editor.chain().focus().toggleStrike().run(),
        isActive: (editor) => editor.isActive("strike"),
      },
      {
        id: "code",
        label: "Inline code",
        icon: Code,
        command: (editor) => editor.chain().focus().toggleCode().run(),
        isActive: (editor) => editor.isActive("code"),
      },
    ],
  },
  {
    id: "blocks",
    items: [
      {
        id: "quote",
        label: "Quote",
        icon: Quote,
        command: (editor) => editor.chain().focus().toggleBlockquote().run(),
        isActive: (editor) => editor.isActive("blockquote"),
      },
    ],
  },
  {
    id: "alignment",
    items: [
      {
        id: "align-left",
        label: "Align left",
        icon: AlignLeft,
        command: (editor) => editor.chain().focus().setTextAlign("left").run(),
        isActive: (editor) => editor.isActive({ textAlign: "left" }),
      },
      {
        id: "align-center",
        label: "Align center",
        icon: AlignCenter,
        command: (editor) => editor.chain().focus().setTextAlign("center").run(),
        isActive: (editor) => editor.isActive({ textAlign: "center" }),
      },
      {
        id: "align-right",
        label: "Align right",
        icon: AlignRight,
        command: (editor) => editor.chain().focus().setTextAlign("right").run(),
        isActive: (editor) => editor.isActive({ textAlign: "right" }),
      },
      {
        id: "align-justify",
        label: "Justify",
        icon: AlignJustify,
        command: (editor) => editor.chain().focus().setTextAlign("justify").run(),
        isActive: (editor) => editor.isActive({ textAlign: "justify" }),
      },
      {
        id: "outdent",
        label: "Outdent",
        icon: IndentDecrease,
        command: (editor) => editor.chain().focus().outdent().run(),
        isDisabled: (editor) => !selectionHasIndent(editor),
      },
      {
        id: "indent",
        label: "Indent",
        icon: IndentIncrease,
        command: (editor) => editor.chain().focus().indent().run(),
      },
    ],
  },
  {
    id: "cleanup",
    items: [
      {
        id: "clear-formatting",
        label: "Clear formatting",
        icon: RemoveFormatting,
        command: (editor) => editor.chain().focus().unsetAllMarks().clearNodes().run(),
      },
    ],
  },
];

export const colorPalettes: ColorPaletteDefinition[] = [
  {
    id: "text-color",
    label: "Text color",
    icon: <span className="rt-color-glyph">A</span>,
    colors: [
      // Neutral
      "#0f172a","#1e293b","#334155","#475569","#64748b","#94a3b8","#cbd5e1","#e2e8f0","#f1f5f9","#ffffff",
      // Red
      "#7f1d1d","#991b1b","#b91c1c","#dc2626","#ef4444","#f87171","#fca5a5","#fecaca","#fee2e2","#fff5f5",
      // Orange
      "#7c2d12","#9a3412","#c2410c","#ea580c","#f97316","#fb923c","#fdba74","#fed7aa","#ffedd5","#fff7ed",
      // Amber
      "#713f12","#854d0e","#a16207","#ca8a04","#eab308","#facc15","#fde047","#fef08a","#fef9c3","#fefce8",
      // Lime
      "#365314","#3f6212","#4d7c0f","#65a30d","#84cc16","#a3e635","#bef264","#d9f99d","#ecfccb","#f7fee7",
      // Green
      "#14532d","#166534","#15803d","#16a34a","#22c55e","#4ade80","#86efac","#bbf7d0","#dcfce7","#f0fdf4",
      // Teal
      "#134e4a","#115e59","#0f766e","#0d9488","#14b8a6","#2dd4bf","#5eead4","#99f6e4","#ccfbf1","#f0fdfa",
      // Blue
      "#172554","#1e3a8a","#1d4ed8","#2563eb","#3b82f6","#60a5fa","#93c5fd","#bfdbfe","#dbeafe","#eff6ff",
      // Violet
      "#2e1065","#4a1d96","#6d28d9","#7c3aed","#8b5cf6","#a78bfa","#c4b5fd","#ddd6fe","#ede9fe","#f5f3ff",
      // Pink
      "#500724","#881337","#be123c","#e11d48","#f43f5e","#fb7185","#fda4af","#fecdd3","#ffe4e6","#fff1f2",
    ],
    command: (editor, color) => editor.chain().focus().setColor(color).run(),
    clear: (editor) => editor.chain().focus().unsetColor().run(),
    isActive: (editor) => Boolean(editor.getAttributes("textStyle").color),
  },
  {
    id: "highlight",
    label: "Highlight",
    icon: <Highlighter />,
    colors: [
      // Vivid highlights
      "#fde047","#fb923c","#f87171","#f472b6","#c084fc","#818cf8","#60a5fa","#34d399","#2dd4bf","#a3e635",
      // Pastel highlights
      "#fef9c3","#ffedd5","#fee2e2","#fce7f3","#f3e8ff","#e0e7ff","#dbeafe","#d1fae5","#ccfbf1","#ecfccb",
    ],
    command: (editor, color) => editor.chain().focus().toggleHighlight({ color }).run(),
    clear: (editor) => editor.chain().focus().unsetHighlight().run(),
    isActive: (editor) => editor.isActive("highlight"),
  },
];

export function getToolbarButtons() {
  return toolbarGroups.flatMap((group) => group.items);
}

function selectionHasIndent(editor: Parameters<ToolbarButtonDefinition["command"]>[0]) {
  const { from, to } = editor.state.selection;
  let hasIndent = false;

  editor.state.doc.nodesBetween(from, to, (node) => {
    if (Number(node.attrs.indent ?? 0) > 0) {
      hasIndent = true;
      return false;
    }

    return true;
  });

  return hasIndent;
}
