# react-tiptap-shadcn

A publishable React rich text editor package built on Tiptap 3 and shadcn-style UI primitives.

The editor is inspired by Tiptap's MIT-licensed Simple Editor template, but the floating menus are replaced with Radix/shadcn-style popover, dropdown, tooltip, separator, and button primitives.

## Install

```bash
pnpm add react-tiptap-shadcn @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/core
```

Install peer Tiptap extensions if your package manager does not install peers automatically:

```bash
pnpm add \
  @tiptap/extension-highlight \
  @tiptap/extension-image \
  @tiptap/extension-link \
  @tiptap/extension-placeholder \
  @tiptap/extension-task-item \
  @tiptap/extension-task-list \
  @tiptap/extension-text-align \
  @tiptap/extension-text-style \
  @tiptap/extension-underline \
  @tiptap/extension-table \
  @tiptap/extension-table-row \
  @tiptap/extension-table-cell \
  @tiptap/extension-table-header
```

## Usage

```tsx
import { SimpleEditor } from "react-tiptap-shadcn";
import "react-tiptap-shadcn/style.css";

export function EditorPage() {
  return (
    <SimpleEditor
      content="<h2>Hello Tiptap</h2><p>Start writing...</p>"
      onUpdate={({ html, json, text }) => {
        console.log({ html, json, text });
      }}
    />
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string \| JSONContent` | `"<h2>Start writing</h2>…"` | Initial HTML or ProseMirror JSON |
| `editable` | `boolean` | `true` | Toggle read-only mode |
| `immediatelyRender` | `boolean` | `false` | Skip SSR hydration guard |
| `className` | `string` | — | Class on the outer shell |
| `editorClassName` | `string` | — | Class on the content area |
| `labels` | `SimpleEditorLabels` | — | Override placeholder strings |
| `onUpdate` | `(payload) => void` | — | Fires on every change; receives `{ html, json, text }` |
| `onImageUpload` | `(file) => Promise<string> \| string` | — | Custom upload handler; falls back to base64 |

## Features

### Toolbar
- **Block format** — Paragraph, Heading 1/2/3 via dropdown
- **Font size** — Preset sizes (10–72 px) via dropdown; "Default" clears the override
- **Inline marks** — Bold, Italic, Underline, Strikethrough, Inline code
- **Text color** — 100-color palette (10 hue families × 10 shades) with "Remove color" and native color picker
- **Highlight** — 20 highlight colors (vivid + pastel rows) with "Remove color" and native color picker
- **Lists** — Bullet, Ordered, Task list via dropdown
- **Alignment** — Left, Center, Right, Justify
- **Quote** — Blockquote toggle
- **History** — Undo / Redo
- **Clear formatting** — Strips all marks and block types
- **Link** — Insert/edit link with URL + text fields
- **Image** — Insert by URL or file upload
- **Table** — Grid picker (10 × 10, hover to select dimensions) for insertion

### Floating toolbar (text selection)
Appears above any text selection. Contains: block format, inline marks, text/highlight color, lists, alignment, quote, link, clear formatting.

### Link toolbar
Appears when the cursor is inside a link. Shows the URL, with buttons to open in new tab, edit (URL-only popover), or remove the link.

### Image
- **Resize** — Drag the right-edge handle to resize; minimum 50 px width
- **Floating toolbar** — Appears when image is selected; buttons for Align left / Align center / Align right and Delete
- **Alignment** — Stored as `data-align` on the image wrapper; serialized to HTML
- **Upload** — Pass `onImageUpload` for custom upload; falls back to base64 data URL

### Table
- **Insert** — Grid picker in the main toolbar (hover to choose up to 10 × 10, click to insert with header row)
- **Floating toolbar** — Appears whenever the cursor is inside a table:
  - **Row**: Add row above / Add row below / Delete row
  - **Column**: Add column left / Add column right / Delete column
  - **Cell**: Merge cells (enabled when multiple cells are selected) / Split cell (enabled when on a merged cell)
  - **Table**: Delete table
- **Column resize** — Drag the handle between column headers to resize; powered by Tiptap's built-in `resizable` option
- **Cell selection** — Multi-cell selection highlighted with a primary-color tint

## Development

```bash
pnpm install
pnpm dev        # Vite dev server with src/demo.tsx
pnpm build      # tsc + copy CSS to dist/
pnpm typecheck  # type-check without emit
```

No test suite is included.

## Tailwind and shadcn

Configured for Tailwind CSS v4 and shadcn/ui component generation.

- Tailwind v4 entry: `src/tailwind.css`
- shadcn config: `components.json`
- shadcn UI target: `src/ui`
- Utility alias: `@/lib/utils`

The published stylesheet is `react-tiptap-shadcn/style.css` (not processed by Vite's lib build — copied by `scripts/copy-css.mjs`). All editor-specific CSS classes use the `rt-` prefix.

## CSS customization

Override the CSS variables on `:root` (or a scoping selector) to theme the editor:

```css
:root {
  --rt-background: #ffffff;
  --rt-foreground: #111827;
  --rt-muted: #6b7280;
  --rt-border: #d7dde7;
  --rt-panel: #f8fafc;
  --rt-panel-strong: #eef2f7;
  --rt-primary: #2563eb;
  --rt-primary-foreground: #ffffff;
  --rt-ring: rgba(37, 99, 235, 0.3);
  --rt-radius: 8px;
  --rt-shadow: 0 16px 40px rgba(15, 23, 42, 0.14);
}
```

Dark mode variables are applied automatically via `@media (prefers-color-scheme: dark)`.
