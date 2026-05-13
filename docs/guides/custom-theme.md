# Customize Theme

The editor uses CSS variables with the `rt-` prefix. Import the package stylesheet once, then override variables globally or inside a scoped container.

## Import Styles

```tsx
import "react-editor-tiptap/style.css";
```

## Force Light, Dark, or System Mode

Use the `theme` prop for one editor instance.

```tsx
<SimpleEditor theme="dark" />
```

Supported values:

- `system`
- `light`
- `dark`

`system` follows the user's `prefers-color-scheme` media setting.

## Override Theme Variables

Override variables globally when all editor instances should share the same brand theme.

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

Use app-level selectors when your app already has light and dark mode classes.

```css
.dark {
  --rt-background: #101318;
  --rt-foreground: #f8fafc;
  --rt-muted: #9ca3af;
  --rt-border: #2b3442;
  --rt-panel: #171c24;
  --rt-panel-strong: #242c38;
  --rt-primary: #60a5fa;
  --rt-primary-foreground: #0f172a;
  --rt-ring: rgba(96, 165, 250, 0.35);
}
```

## Scope a Theme to One Editor

Use `className` to scope variables to one editor shell.

```tsx
<SimpleEditor className="article-editor" />
```

```css
.article-editor {
  --rt-primary: #16a34a;
  --rt-ring: rgba(22, 163, 74, 0.28);
  --rt-editor-content-max-height: 640px;
}
```

## Theme Rendered Content

`RichTextContent` uses the same content CSS and accepts the same `theme` values.

```tsx
import { RichTextContent } from "react-editor-tiptap";

export function Article({ html }: { html: string }) {
  return <RichTextContent content={html} theme="dark" />;
}
```

## Checklist

- Import `react-editor-tiptap/style.css` once in the app.
- Override `--rt-*` variables instead of editing package CSS.
- Use `theme` for per-instance mode control.
- Theme `RichTextContent` the same way as `SimpleEditor` when displaying saved content.
