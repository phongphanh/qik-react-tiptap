import type { Editor } from "@tiptap/core";

export function preventEditableLinkNavigation(event: MouseEvent) {
  const target = event.target;

  if (!(target instanceof Element)) {
    return false;
  }

  const link = target.closest("a[href]");

  if (!link) {
    return false;
  }

  event.preventDefault();
  return true;
}

export function selectClickedLink(editor: Editor, event: MouseEvent) {
  const target = event.target;

  if (!(target instanceof Element)) {
    return false;
  }

  const link = target.closest("a[href]");

  if (!(link instanceof HTMLAnchorElement)) {
    return false;
  }

  const pos = editor.view.posAtDOM(link, 0);
  editor.chain().focus().setTextSelection(pos).extendMarkRange("link").run();

  return true;
}
