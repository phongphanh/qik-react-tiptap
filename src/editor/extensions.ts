import type { Extensions } from "@tiptap/core";
import { CharacterCount } from "@tiptap/extension-character-count";
import type { CharacterCountOptions } from "@tiptap/extension-character-count";
import { Highlight } from "@tiptap/extension-highlight";
import type { HighlightOptions } from "@tiptap/extension-highlight";
import { Link } from "@tiptap/extension-link";
import type { LinkOptions } from "@tiptap/extension-link";
import type { ImageOptions } from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import type { TableKitOptions } from "@tiptap/extension-table";
import { Placeholder } from "@tiptap/extension-placeholder";
import type { PlaceholderOptions } from "@tiptap/extension-placeholder";
import { TaskItem } from "@tiptap/extension-task-item";
import type { TaskItemOptions } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import type { TaskListOptions } from "@tiptap/extension-task-list";
import { TextAlign } from "@tiptap/extension-text-align";
import type { TextAlignOptions } from "@tiptap/extension-text-align";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import type { ColorOptions, TextStyleOptions } from "@tiptap/extension-text-style";
import { Underline } from "@tiptap/extension-underline";
import type { UnderlineOptions } from "@tiptap/extension-underline";
import { StarterKit } from "@tiptap/starter-kit";
import type { StarterKitOptions } from "@tiptap/starter-kit";
import { EnhancedImage } from "./image-extension";
import { FontSize } from "./font-size";
import { Indent } from "./indent";
import type { IndentOptions } from "./indent";
import { PasteNormalizer } from "./paste-normalizer";
import type { PasteNormalizerOptions } from "./paste-normalizer";

type ExtensionConfig<T> = Partial<T> | false;

export interface SimpleEditorExtensionOptions {
  starterKit?: ExtensionConfig<StarterKitOptions>;
  underline?: ExtensionConfig<UnderlineOptions>;
  textStyle?: ExtensionConfig<TextStyleOptions>;
  color?: ExtensionConfig<ColorOptions>;
  fontSize?: false;
  indent?: ExtensionConfig<IndentOptions>;
  pasteNormalizer?: ExtensionConfig<PasteNormalizerOptions>;
  characterCount?: ExtensionConfig<CharacterCountOptions>;
  highlight?: ExtensionConfig<HighlightOptions>;
  link?: ExtensionConfig<LinkOptions>;
  image?: ExtensionConfig<ImageOptions>;
  table?: ExtensionConfig<TableKitOptions>;
  taskList?: ExtensionConfig<TaskListOptions>;
  taskItem?: ExtensionConfig<TaskItemOptions>;
  textAlign?: ExtensionConfig<TextAlignOptions>;
  placeholderOptions?: ExtensionConfig<PlaceholderOptions>;
}

export interface CreateSimpleEditorExtensionsOptions extends SimpleEditorExtensionOptions {
  characterLimit?: number | null;
  placeholder?: string;
}

export function createSimpleEditorExtensions({
  characterLimit = null,
  placeholder = "Write something...",
  ...options
}: CreateSimpleEditorExtensionsOptions = {}): Extensions {
  const extensions: Extensions = [];

  const starterKit = mergeExtensionOptions<StarterKitOptions>(
    {
      heading: { levels: [1, 2, 3] },
      link: false,
      underline: false,
    },
    options.starterKit,
  );
  if (starterKit !== false) extensions.push(StarterKit.configure(starterKit));

  if (options.underline !== false) extensions.push(Underline.configure(options.underline));
  if (options.textStyle !== false) extensions.push(TextStyle.configure(options.textStyle));
  if (options.color !== false) extensions.push(Color.configure(options.color));
  if (options.fontSize !== false) extensions.push(FontSize);
  if (options.indent !== false) extensions.push(Indent.configure(options.indent));
  if (options.pasteNormalizer !== false) {
    extensions.push(PasteNormalizer.configure(options.pasteNormalizer));
  }

  const characterCount = mergeExtensionOptions<CharacterCountOptions>(
    { limit: characterLimit },
    options.characterCount,
  );
  if (characterCount !== false) extensions.push(CharacterCount.configure(characterCount));

  const highlight = mergeExtensionOptions<HighlightOptions>(
    { multicolor: true },
    options.highlight,
  );
  if (highlight !== false) extensions.push(Highlight.configure(highlight));

  const link = mergeExtensionOptions<LinkOptions>(
    {
      openOnClick: false,
      autolink: true,
      defaultProtocol: "https",
      HTMLAttributes: {
        target: null,
      },
    },
    options.link,
  );
  if (link !== false) extensions.push(Link.configure(link));

  const image = mergeExtensionOptions<ImageOptions>({ allowBase64: true }, options.image);
  if (image !== false) extensions.push(EnhancedImage.configure(image));

  const table = mergeExtensionOptions<TableKitOptions>(
    {
      table: { resizable: true, renderWrapper: true },
      tableCell: {},
      tableHeader: {},
      tableRow: {},
    },
    options.table,
  );
  if (table !== false) extensions.push(TableKit.configure(table));

  if (options.taskList !== false) extensions.push(TaskList.configure(options.taskList));

  const taskItem = mergeExtensionOptions<TaskItemOptions>({ nested: true }, options.taskItem);
  if (taskItem !== false) extensions.push(TaskItem.configure(taskItem));

  const textAlign = mergeExtensionOptions<TextAlignOptions>(
    { types: ["heading", "paragraph"] },
    options.textAlign,
  );
  if (textAlign !== false) extensions.push(TextAlign.configure(textAlign));

  const placeholderOptions = mergeExtensionOptions<PlaceholderOptions>(
    { placeholder },
    options.placeholderOptions,
  );
  if (placeholderOptions !== false) extensions.push(Placeholder.configure(placeholderOptions));

  return extensions;
}

function mergeExtensionOptions<T>(
  defaults: Partial<T>,
  override?: ExtensionConfig<T>,
): Partial<T> | false {
  if (override === false) return false;
  return { ...defaults, ...override };
}
