# Integrate With Server Image Upload

Use `onImageUpload` when inserted files should be uploaded to your server instead of stored as base64 data URLs. The handler receives the selected `File` and must return either a URL string or image attributes.

## Return a URL

```tsx
import { SimpleEditor } from "react-tiptap-shadcn";
import "react-tiptap-shadcn/style.css";

export function Editor() {
  return (
    <SimpleEditor
      onImageUpload={async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/uploads", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Image upload failed");
        }

        const data = await response.json() as { url: string };
        return data.url;
      }}
      onImageUploadError={(error, file) => {
        console.error("Upload failed", { error, file });
      }}
    />
  );
}
```

## Return Image Attributes

Return an object when the server provides metadata that should be stored in the document.

```tsx
<SimpleEditor
  onImageUpload={async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/uploads", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Image upload failed");
    }

    const image = await response.json() as {
      url: string;
      alt?: string;
      width?: number;
      height?: number;
    };

    return {
      src: image.url,
      alt: image.alt,
      width: image.width,
      height: image.height,
    };
  }}
/>
```

## Client-Side Validation

Validate files before sending them to the server. Throwing from `onImageUpload` routes the failure to `onImageUploadError`.

```tsx
<SimpleEditor
  onImageUpload={async (file) => {
    if (!file.type.startsWith("image/")) {
      throw new Error("Only image files are allowed");
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Images must be smaller than 5 MB");
    }

    return uploadImage(file);
  }}
  onImageUploadError={(error) => {
    reportUploadError(error);
  }}
/>
```

## Server Contract

The upload endpoint should return a permanent URL. Avoid storing editor content with temporary signed URLs unless your read path refreshes those URLs before rendering.

Recommended response shape:

```json
{
  "url": "https://cdn.example.com/uploads/image.jpg",
  "alt": "Product screenshot",
  "width": 1280,
  "height": 720
}
```

## Checklist

- Validate file type and size before upload.
- Return a permanent `src` URL from the upload handler.
- Use `onImageUploadError` for toast notifications, logging, or form errors.
- Keep server-side authorization and virus scanning outside the editor package.
