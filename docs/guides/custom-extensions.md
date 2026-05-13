# Add Custom Extensions

Use `extensions` when your app needs behavior that is not included in the default editor, such as a custom node, mark, keyboard shortcut, paste rule, slash command, mention, or app-specific schema.

## Basic Usage

Pass an array of Tiptap extensions to append them after the built-in extensions.

```tsx
import { Extension } from "@tiptap/core";
import { SimpleEditor } from "react-editor-tiptap";
import "react-editor-tiptap/style.css";

const TrackChanges = Extension.create({
  name: "trackChanges",
});

export function Editor() {
  return <SimpleEditor extensions={[TrackChanges]} />;
}
```

## Use Defaults Explicitly

For most production use cases, prefer the callback form. It receives the default extension list and lets you append, filter, or reorder extensions in one place.

```tsx
<SimpleEditor
  extensions={(defaults) => [
    ...defaults,
    TrackChanges,
    MyMentionExtension.configure({
      suggestion: mentionSuggestion,
    }),
  ]}
/>
```

## Replace a Built-In Extension

If your custom extension uses the same Tiptap extension name as a built-in extension, disable the built-in first. Duplicate extension names can cause unpredictable command, schema, and storage behavior.

```tsx
<SimpleEditor
  extensionOptions={{
    link: false,
  }}
  extensions={(defaults) => [
    ...defaults,
    MyLinkExtension.configure({
      openOnClick: false,
    }),
  ]}
/>
```

## Keep Rendering in Sync

If content saved by the editor depends on a custom extension, pass the same extension to `RichTextContent` or `getRichTextHTML`.

```tsx
import { RichTextContent } from "react-editor-tiptap";

export function Article({ content }: { content: unknown }) {
  return (
    <RichTextContent
      content={content}
      extensions={(defaults) => [...defaults, TrackChanges]}
    />
  );
}
```

## Checklist

- Use `extensions={(defaults) => [...]}` when you need full control.
- Disable a built-in extension before replacing it with another extension of the same name.
- Reuse the same extension list when rendering saved JSON content.
- Keep custom extensions stable across renders with module constants or `useMemo`.
