# Customize Existing Extensions

Use `extensionOptions` to configure or disable the editor's built-in extensions without rebuilding the full extension list.

## Configure Built-In Extensions

Each key maps to the matching built-in extension configuration.

```tsx
import { SimpleEditor } from "react-tiptap-shadcn";
import "react-tiptap-shadcn/style.css";

export function Editor() {
  return (
    <SimpleEditor
      extensionOptions={{
        characterCount: {
          limit: 10000,
        },
        link: {
          autolink: false,
          defaultProtocol: "https",
        },
        highlight: {
          multicolor: true,
        },
        table: {
          table: {
            resizable: true,
            renderWrapper: true,
            cellMinWidth: 96,
          },
        },
      }}
    />
  );
}
```

## Disable Built-In Extensions

Set a built-in extension option to `false` when your product does not need the feature or when you plan to provide a replacement extension.

```tsx
<SimpleEditor
  extensionOptions={{
    image: false,
    table: false,
    highlight: false,
  }}
/>
```

## Supported Keys

`extensionOptions` supports these built-ins:

- `starterKit`
- `underline`
- `textStyle`
- `color`
- `fontSize`
- `indent`
- `pasteNormalizer`
- `characterCount`
- `highlight`
- `link`
- `image`
- `table`
- `taskList`
- `taskItem`
- `textAlign`
- `placeholderOptions`

Use the top-level `labels.placeholder` prop for the common placeholder text case.

```tsx
<SimpleEditor labels={{ placeholder: "Write the article..." }} />
```

Use `placeholderOptions` when you need the full Tiptap placeholder configuration.

```tsx
<SimpleEditor
  extensionOptions={{
    placeholderOptions: {
      includeChildren: true,
      placeholder: ({ node }) =>
        node.type.name === "heading" ? "Heading" : "Write something...",
    },
  }}
/>
```

## Notes

- Extension options are shallow-merged with this package's defaults.
- If you replace nested options, include the nested defaults you still need.
- `fontSize` currently supports disabling with `false`; it does not expose runtime configuration.
