import * as React from "react";
import type { Editor, EditorOptions, Extensions, JSONContent } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import { cn } from "./lib/utils";
import {
  createSimpleEditorExtensions,
  type SimpleEditorExtensionOptions,
} from "./editor/extensions";
import { fileToDataUrl } from "./editor/file";
import { preventEditableLinkNavigation } from "./editor/link-events";
import { EditorThemeProvider, getThemeAttribute, type SimpleEditorTheme } from "./theme";
import { EditorToolbar } from "./toolbar/editor-toolbar";
import { FloatingToolbar } from "./toolbar/floating-toolbar";
import { LinkToolbar } from "./toolbar/link-toolbar";
import { TableToolbar } from "./toolbar/table-toolbar";
import { useLinkToolbar } from "./toolbar/use-link-toolbar";
import { useTableToolbar } from "./toolbar/use-table-toolbar";
import { useToolbarState } from "./toolbar/use-toolbar-state";

export interface SimpleEditorOnUpdatePayload {
  html: string;
  json: JSONContent;
  text: string;
  editor: Editor;
}

export interface SimpleEditorLabels {
  placeholder?: string;
  linkPlaceholder?: string;
  imageUrlPlaceholder?: string;
}

export type SimpleEditorOutput = "html" | "json" | "text";
export type SimpleEditorValue = string | JSONContent;
export type SimpleEditorChangeValue = string | JSONContent;

export interface SimpleEditorImageAttrs {
  src: string;
  alt?: string;
  title?: string;
  width?: number;
  height?: number;
}

export type SimpleEditorImageUploadResult = string | SimpleEditorImageAttrs;
export type SimpleEditorExtensionsProp =
  | Extensions
  | ((defaultExtensions: Extensions) => Extensions);

export interface SimpleEditorProps {
  content?: string | JSONContent;
  value?: SimpleEditorValue;
  defaultValue?: SimpleEditorValue;
  output?: SimpleEditorOutput;
  className?: string;
  editorClassName?: string;
  editorProps?: EditorOptions["editorProps"];
  editable?: boolean;
  extensionOptions?: SimpleEditorExtensionOptions;
  extensions?: SimpleEditorExtensionsProp;
  id?: string;
  immediatelyRender?: boolean;
  invalid?: boolean;
  labels?: SimpleEditorLabels;
  name?: string;
  theme?: SimpleEditorTheme;
  onBlur?: () => void;
  onChange?: (value: SimpleEditorChangeValue, payload: SimpleEditorOnUpdatePayload) => void;
  onUpdate?: (payload: SimpleEditorOnUpdatePayload) => void;
  onImageUpload?: (
    file: File,
  ) => Promise<SimpleEditorImageUploadResult> | SimpleEditorImageUploadResult;
  onImageUploadError?: (error: unknown, file: File) => void;
}

export function SimpleEditor({
  content,
  value,
  defaultValue,
  output = "html",
  className,
  editorClassName,
  editorProps,
  editable = true,
  extensionOptions,
  extensions: extensionsProp,
  id,
  immediatelyRender = false,
  invalid,
  labels,
  name,
  theme = "system",
  onBlur,
  onChange,
  onUpdate,
  onImageUpload,
  onImageUploadError,
}: SimpleEditorProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const latestHandlersRef = React.useRef({ onBlur, onChange, onUpdate, output });
  const [imageUrl, setImageUrl] = React.useState("");
  const [isUploadingImage, setIsUploadingImage] = React.useState(false);
  latestHandlersRef.current = { onBlur, onChange, onUpdate, output };

  const extensions = React.useMemo(
    () => {
      const defaultExtensions = createSimpleEditorExtensions({
        ...extensionOptions,
        placeholder: labels?.placeholder,
      });

      if (typeof extensionsProp === "function") {
        return extensionsProp(defaultExtensions);
      }

      return extensionsProp ? [...defaultExtensions, ...extensionsProp] : defaultExtensions;
    },
    [extensionOptions, extensionsProp, labels?.placeholder],
  );

  const initialContent =
    value ??
    defaultValue ??
    content ??
    "<h2>Start writing</h2><p>This editor uses Tiptap with shadcn-style controls.</p>";

  const mergedEditorProps = React.useMemo<EditorOptions["editorProps"]>(
    () => ({
      ...editorProps,
      attributes: (state) => {
        const attributes =
          typeof editorProps?.attributes === "function"
            ? editorProps.attributes(state)
            : editorProps?.attributes;

        return {
          ...attributes,
          class: cn("rt-prose", attributes?.class),
        };
      },
      handleDOMEvents: {
        ...editorProps?.handleDOMEvents,
        blur: (view, event) => {
          latestHandlersRef.current.onBlur?.();
          return editorProps?.handleDOMEvents?.blur?.(view, event) ?? false;
        },
        click: (view, event) => {
          preventEditableLinkNavigation(event);
          return editorProps?.handleDOMEvents?.click?.(view, event) ?? false;
        },
        mousedown: (view, event) => {
          preventEditableLinkNavigation(event);
          return editorProps?.handleDOMEvents?.mousedown?.(view, event) ?? false;
        },
      },
    }),
    [editorProps],
  );

  const editor = useEditor({
    immediatelyRender,
    editable,
    content: initialContent,
    extensions,
    editorProps: mergedEditorProps,
    onUpdate: ({ editor }) => {
      const payload = getEditorPayload(editor);
      latestHandlersRef.current.onUpdate?.(payload);
      latestHandlersRef.current.onChange?.(
        getOutputValue(payload, latestHandlersRef.current.output),
        payload,
      );
    },
  });

  React.useEffect(() => {
    if (!editor || value === undefined || isSameEditorContent(editor, value)) {
      return;
    }

    editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);

  const toolbarState = useToolbarState(editor);
  const [linkToolbarState, setLinkToolbarState] = useLinkToolbar(editor);
  const tableToolbarState = useTableToolbar(editor);

  React.useEffect(() => {
    editor?.setEditable(editable);
  }, [editable, editor]);

  const insertImage = React.useCallback(
    (image: string | SimpleEditorImageAttrs = imageUrl) => {
      if (!editor) return;

      const attrs = typeof image === "string" ? { src: image.trim() } : image;
      if (!attrs.src.trim()) return;

      editor.chain().focus().setImage(attrs).run();
      setImageUrl("");
    },
    [editor, imageUrl],
  );

  const handleImageFileChange = React.useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";

      if (!file || !editor) return;

      setIsUploadingImage(true);
      try {
        const result = onImageUpload ? await onImageUpload(file) : await fileToDataUrl(file);
        insertImage(normalizeImageUploadResult(result));
      } catch (error) {
        onImageUploadError?.(error, file);
      } finally {
        setIsUploadingImage(false);
      }
    },
    [editor, insertImage, onImageUpload, onImageUploadError],
  );

  if (!editor) {
    return (
      <div
        id={id}
        aria-invalid={invalid || undefined}
        className={cn("rt-editor-shell", className)}
        data-name={name}
        data-rt-theme={getThemeAttribute(theme)}
      />
    );
  }

  return (
    <EditorThemeProvider theme={theme}>
      <div
        id={id}
        aria-busy={isUploadingImage || undefined}
        aria-invalid={invalid || undefined}
        className={cn("rt-editor-shell", className)}
        data-invalid={invalid || undefined}
        data-name={name}
        data-rt-theme={getThemeAttribute(theme)}
        data-uploading-image={isUploadingImage || undefined}
      >
        <EditorToolbar
          editor={editor}
          state={toolbarState}
          fileInputRef={fileInputRef}
          imageUrl={imageUrl}
          labels={labels}
          onImageFileChange={handleImageFileChange}
          onImageUrlChange={setImageUrl}
          onInsertImage={() => insertImage()}
        />

        <EditorContent
          editor={editor}
          className={cn("rt-editor-content", editorClassName)}
        />

        <div className="rt-editor-footer">
          <span>{toolbarState.characterCount.toLocaleString()} characters</span>
        </div>

        <FloatingToolbar
          disabled={Boolean(linkToolbarState)}
          editor={editor}
          state={toolbarState}
          labels={labels}
          theme={theme}
        />
        <LinkToolbar
          editor={editor}
          onOpenChange={(open) => {
            if (!open) {
              setLinkToolbarState(null);
            }
          }}
          state={linkToolbarState}
          placeholder={labels?.linkPlaceholder}
        />
        <TableToolbar editor={editor} state={tableToolbarState} />
      </div>
    </EditorThemeProvider>
  );
}

function getEditorPayload(editor: Editor): SimpleEditorOnUpdatePayload {
  return {
    html: editor.getHTML(),
    json: editor.getJSON(),
    text: editor.getText(),
    editor,
  };
}

function getOutputValue(
  payload: SimpleEditorOnUpdatePayload,
  output: SimpleEditorOutput,
): SimpleEditorChangeValue {
  if (output === "json") return payload.json;
  if (output === "text") return payload.text;
  return payload.html;
}

function normalizeImageUploadResult(
  result: SimpleEditorImageUploadResult,
): SimpleEditorImageAttrs {
  return typeof result === "string" ? { src: result } : result;
}

function isSameEditorContent(editor: Editor, value: SimpleEditorValue) {
  if (typeof value === "string") {
    return editor.getHTML() === value;
  }

  return JSON.stringify(editor.getJSON()) === JSON.stringify(value);
}
