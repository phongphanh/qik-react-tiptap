import * as React from "react";
import { EditorContent, type JSONContent, useEditor } from "@tiptap/react";
import { cn } from "./lib/utils";
import { createSimpleEditorExtensions } from "./editor/extensions";
import { fileToDataUrl } from "./editor/file";
import { preventEditableLinkNavigation } from "./editor/link-events";
import { EditorToolbar } from "./toolbar/editor-toolbar";
import { FloatingToolbar } from "./toolbar/floating-toolbar";
import { LinkToolbar } from "./toolbar/link-toolbar";
import { TableToolbar } from "./toolbar/table-toolbar";
import { useFloatingToolbar } from "./toolbar/use-floating-toolbar";
import { useLinkToolbar } from "./toolbar/use-link-toolbar";
import { useTableToolbar } from "./toolbar/use-table-toolbar";
import { useToolbarState } from "./toolbar/use-toolbar-state";

export interface SimpleEditorOnUpdatePayload {
  html: string;
  json: JSONContent;
  text: string;
}

export interface SimpleEditorLabels {
  placeholder?: string;
  linkPlaceholder?: string;
  imageUrlPlaceholder?: string;
}

export interface SimpleEditorProps {
  content?: string | JSONContent;
  className?: string;
  editorClassName?: string;
  editable?: boolean;
  immediatelyRender?: boolean;
  labels?: SimpleEditorLabels;
  onUpdate?: (payload: SimpleEditorOnUpdatePayload) => void;
  onImageUpload?: (file: File) => Promise<string> | string;
}

export function SimpleEditor({
  content = "<h2>Start writing</h2><p>This editor uses Tiptap with shadcn-style controls.</p>",
  className,
  editorClassName,
  editable = true,
  immediatelyRender = false,
  labels,
  onUpdate,
  onImageUpload,
}: SimpleEditorProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = React.useState("");

  const extensions = React.useMemo(
    () =>
      createSimpleEditorExtensions({
        placeholder: labels?.placeholder,
      }),
    [labels?.placeholder],
  );

  const editor = useEditor({
    immediatelyRender,
    editable,
    content,
    extensions,
    editorProps: {
      attributes: {
        class: "rt-prose",
      },
      handleDOMEvents: {
        click: (_view, event) => preventEditableLinkNavigation(event),
        mousedown: (_view, event) => preventEditableLinkNavigation(event),
      },
    },
    onUpdate: ({ editor }) => {
      onUpdate?.({
        html: editor.getHTML(),
        json: editor.getJSON(),
        text: editor.getText(),
      });
    },
  });

  const toolbarState = useToolbarState(editor);
  const floatingToolbarPosition = useFloatingToolbar(editor);
  const [linkToolbarState, setLinkToolbarState] = useLinkToolbar(editor);
  const tableToolbarState = useTableToolbar(editor);

  React.useEffect(() => {
    editor?.setEditable(editable);
  }, [editable, editor]);

  const insertImage = React.useCallback(
    (src = imageUrl) => {
      if (!editor || !src.trim()) return;

      editor.chain().focus().setImage({ src: src.trim() }).run();
      setImageUrl("");
    },
    [editor, imageUrl],
  );

  const handleImageFileChange = React.useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";

      if (!file || !editor) return;

      const src = onImageUpload
        ? await onImageUpload(file)
        : await fileToDataUrl(file);

      insertImage(src);
    },
    [editor, insertImage, onImageUpload],
  );

  if (!editor) {
    return <div className={cn("rt-editor-shell", className)} />;
  }

  return (
    <div className={cn("rt-editor-shell", className)}>
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
        editor={editor}
        state={toolbarState}
        position={linkToolbarState ? null : floatingToolbarPosition}
        labels={labels}
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
  );
}
