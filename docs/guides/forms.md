# Integrate With Forms

Use `value`, `onChange`, `onBlur`, `invalid`, and `output` for form libraries such as React Hook Form. The editor can emit HTML, JSON, or plain text.

## React Hook Form

```tsx
import { Controller, useForm } from "react-hook-form";
import { SimpleEditor } from "react-tiptap-shadcn";
import "react-tiptap-shadcn/style.css";

interface ArticleFormValues {
  body: string;
}

export function ArticleForm() {
  const form = useForm<ArticleFormValues>({
    defaultValues: {
      body: "<p></p>",
    },
  });

  return (
    <form onSubmit={form.handleSubmit(console.log)}>
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
    </form>
  );
}
```

## Zod Validation

For HTML output, validate the emitted string.

```tsx
import { z } from "zod";

export const articleSchema = z.object({
  body: z.string().min(1, "Body is required"),
});
```

For JSON output, keep the field typed as Tiptap JSON content and validate the shape your server accepts.

```tsx
import type { JSONContent } from "@tiptap/core";
import { z } from "zod";

export const articleJsonSchema = z.object({
  type: z.string().optional(),
  content: z.array(z.unknown()).optional(),
});

interface ArticleFormValues {
  body: JSONContent;
}
```

```tsx
<Controller
  name="body"
  control={form.control}
  render={({ field, fieldState }) => (
    <SimpleEditor
      value={field.value}
      output="json"
      invalid={fieldState.invalid}
      onBlur={field.onBlur}
      onChange={field.onChange}
    />
  )}
/>
```

## Output Choice

- Use `output="html"` when your backend stores rendered HTML.
- Use `output="json"` when you need lossless rich text, custom extensions, or stable controlled values.
- Use `output="text"` for plain-text fields, search previews, or validation-only flows.

## Checklist

- Always pass `onBlur` from the form field so touched state works.
- Pass `invalid` from form state to style validation errors.
- Prefer `output="json"` when the content uses custom nodes or marks.
- Sanitize HTML on the server before displaying user-generated content.
