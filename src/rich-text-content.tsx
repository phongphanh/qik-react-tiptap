import * as React from "react";
import { generateHTML, type Extensions, type JSONContent } from "@tiptap/core";
import { cn } from "./lib/utils";
import {
  createSimpleEditorExtensions,
  type CreateSimpleEditorExtensionsOptions,
} from "./editor/extensions";
import { getThemeAttribute, type SimpleEditorTheme } from "./theme";

export type RichTextContentValue = string | JSONContent;
export type RichTextExtensionsProp =
  | Extensions
  | ((defaultExtensions: Extensions) => Extensions);

export interface RichTextContentOptions {
  extensionOptions?: CreateSimpleEditorExtensionsOptions;
  extensions?: RichTextExtensionsProp;
}

export interface RichTextContentProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "content">,
    RichTextContentOptions {
  content: RichTextContentValue;
  theme?: SimpleEditorTheme;
}

export function RichTextContent({
  className,
  content,
  extensionOptions,
  extensions,
  theme = "system",
  ...props
}: RichTextContentProps) {
  const html = React.useMemo(
    () => getRichTextHTML(content, { extensionOptions, extensions }),
    [content, extensionOptions, extensions],
  );

  return (
    <div
      className={cn("rt-prose rt-content-viewer", className)}
      data-rt-theme={getThemeAttribute(theme)}
      dangerouslySetInnerHTML={{ __html: html }}
      {...props}
    />
  );
}

export function getRichTextHTML(
  content: RichTextContentValue,
  { extensionOptions, extensions }: RichTextContentOptions = {},
) {
  if (typeof content === "string") {
    return content;
  }

  const defaultExtensions = createSimpleEditorExtensions(extensionOptions);
  const resolvedExtensions =
    typeof extensions === "function"
      ? extensions(defaultExtensions)
      : extensions
        ? [...defaultExtensions, ...extensions]
        : defaultExtensions;

  return generateHTML(content, resolvedExtensions);
}
