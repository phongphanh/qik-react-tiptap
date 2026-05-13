# react-tiptap-shadcn

A publishable React rich text editor built on [Tiptap 3](https://tiptap.dev). UI primitives (tooltip, popover, dropdown, button, input, separator) are built from scratch on top of [Floating UI](https://floating-ui.com) — no Radix UI or shadcn dependency.

## Install

```bash
pnpm add react-tiptap-shadcn @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/core
```

Install peer Tiptap extensions if your package manager does not install peers automatically:

```bash
pnpm add \
  @tiptap/extension-bubble-menu \
  @tiptap/extension-character-count \
  @tiptap/extension-highlight \
  @tiptap/extension-image \
  @tiptap/extension-link \
  @tiptap/extension-placeholder \
  @tiptap/extension-table \
  @tiptap/extension-task-item \
  @tiptap/extension-task-list \
  @tiptap/extension-text-align \
  @tiptap/extension-text-style \
  @tiptap/extension-underline \
  @tiptap/extensions
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

## Guides

- [Add custom extensions](./docs/guides/custom-extensions.md)
- [Customize existing extensions](./docs/guides/customize-existing-extensions.md)
- [Integrate with forms](./docs/guides/forms.md)
- [Integrate with server image upload](./docs/guides/server-image-upload.md)
- [Customize theme](./docs/guides/custom-theme.md)

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string \| JSONContent` | `"<h2>Start writing</h2>…"` | Initial HTML or ProseMirror JSON |
| `value` | `string \| JSONContent` | — | Controlled value for form integrations |
| `defaultValue` | `string \| JSONContent` | — | Uncontrolled initial value |
| `output` | `"html" \| "json" \| "text"` | `"html"` | Value format passed to `onChange` |
| `editable` | `boolean` | `true` | Toggle read-only mode |
| `immediatelyRender` | `boolean` | `false` | Skip SSR hydration guard |
| `className` | `string` | — | Class on the outer shell |
| `editorClassName` | `string` | — | Class on the content area |
| `editorProps` | `EditorOptions["editorProps"]` | — | Extra Tiptap editor props merged with the defaults |
| `extensionOptions` | `SimpleEditorExtensionOptions` | — | Configure or disable built-in extensions |
| `extensions` | `Extensions \| (defaults) => Extensions` | — | Append custom extensions or replace the full extension list |
| `theme` | `"light" \| "dark" \| "system"` | `"system"` | Explicit editor theme |
| `invalid` | `boolean` | — | Sets invalid state for form styling |
| `name` | `string` | — | Stored as `data-name` for form/debug hooks |
| `labels` | `SimpleEditorLabels` | — | Override placeholder strings |
| `onChange` | `(value, payload) => void` | — | Form-friendly change callback |
| `onBlur` | `() => void` | — | Fires when the editable area blurs |
| `onUpdate` | `(payload) => void` | — | Fires on every change; receives `{ html, json, text, editor }` |
| `onImageUpload` | `(file) => Promise<string \| ImageAttrs> \| string \| ImageAttrs` | — | Custom upload handler; falls back to base64 |
| `onImageUploadError` | `(error, file) => void` | — | Handles upload failures |

### Forms

`SimpleEditor` can be used with React Hook Form's `Controller` by wiring `value`, `onChange`, and `onBlur`.

```tsx
<Controller
  name="body"
  control={form.control}
  render={({ field, fieldState }) => (
    <SimpleEditor
      value={field.value}
      output="html"
      invalid={fieldState.invalid}
      onBlur={field.onBlur}
      onChange={field.onChange}
    />
  )}
/>
```

Zod can validate the selected output format, for example `z.string().min(1)` for HTML/text or a JSON schema for `output="json"`.

### Custom extensions

Configure built-in extensions with `extensionOptions`:

```tsx
<SimpleEditor
  extensionOptions={{
    characterCount: { limit: 10000 },
    link: { autolink: false },
    table: { table: { resizable: true, renderWrapper: true, cellMinWidth: 80 } },
  }}
/>
```

Disable a built-in extension by setting it to `false`, or add custom extensions with `extensions`:

```tsx
<SimpleEditor
  extensionOptions={{ highlight: false }}
  extensions={(defaults) => [...defaults, MyCustomExtension]}
/>
```

### Server image upload

Return either a URL string or image attributes from `onImageUpload`:

```tsx
<SimpleEditor
  onImageUpload={async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/uploads", { method: "POST", body: formData });
    const image = await res.json();

    return { src: image.url, alt: image.alt };
  }}
  onImageUploadError={(error) => {
    console.error(error);
  }}
/>
```

## Features

### Toolbar
- **Block format** — Paragraph, Heading 1/2/3 via dropdown
- **Font size** — Preset sizes (10–72 px) via dropdown; "Default" clears the override
- **Inline marks** — Bold, Italic, Underline, Strikethrough, Inline code
- **Text color** — 100-color palette (10 hue families × 10 shades) with "Remove color" and native color picker
- **Highlight** — 20 highlight colors (vivid + pastel rows) with "Remove color" and native color picker
- **Lists** — Bullet, Ordered, Task list via dropdown
- **Alignment** — Left, Center, Right, Justify
- **Indent / Outdent** — Indent and outdent controls
- **Quote** — Blockquote toggle
- **History** — Undo / Redo
- **Clear formatting** — Strips all marks and block types
- **Link** — Insert/edit link with URL + text fields
- **Image** — Insert by URL or file upload
- **Table** — Grid picker (10 × 10, hover to select dimensions) for insertion

### Floating toolbar (text selection)
Powered by Tiptap's BubbleMenu with Floating UI positioning. Appears above any text selection and contains: block format, font size, inline marks, text/highlight color, lists, alignment, quote, link, clear formatting. Hidden inside code blocks where marks don't apply. Position updates every animation frame during scroll for smooth tracking.

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
  --rt-editor-content-max-height: 500px;
}
```

Dark mode variables are applied automatically via `@media (prefers-color-scheme: dark)`.

You can also force a mode per editor instance:

```tsx
<SimpleEditor theme="dark" />
```

Or use app-level selectors such as `.dark`, `.light`, `[data-theme="dark"]`, or `[data-theme="light"]`.

All editor-specific CSS classes use the `rt-` prefix. The published stylesheet is imported as:

```ts
import "react-tiptap-shadcn/style.css";
```

## Rendering Saved Content

Use `RichTextContent` to render saved HTML or JSON with the same content styles:

```tsx
import { RichTextContent } from "react-tiptap-shadcn";
import "react-tiptap-shadcn/style.css";

export function Article({ html }: { html: string }) {
  return <RichTextContent content={html} />;
}
```

For server-side or custom rendering pipelines, use `getRichTextHTML(content)`.
