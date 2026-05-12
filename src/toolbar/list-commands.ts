import type { Editor } from "@tiptap/core";
import type { Node as ProseMirrorNode, NodeType } from "@tiptap/pm/model";

type ListKind = "bullet" | "ordered" | "task";

interface ListTypes {
  item: NodeType;
  list: NodeType;
}

interface ParentList {
  node: ProseMirrorNode;
  pos: number;
}

const listTypesByKind = {
  bullet: {
    item: "listItem",
    list: "bulletList",
    toggleCommand: "toggleBulletList",
  },
  ordered: {
    item: "listItem",
    list: "orderedList",
    toggleCommand: "toggleOrderedList",
  },
  task: {
    item: "taskItem",
    list: "taskList",
    toggleCommand: "toggleTaskList",
  },
} as const;

export function toggleList(editor: Editor, kind: ListKind) {
  const parentList = findParentList(editor);
  const target = getListTypes(editor, kind);

  if (!parentList || parentList.node.type === target.list) {
    runToggleCommand(editor, kind);
    return;
  }

  const nextList = createConvertedList(parentList.node, target);

  editor
    .chain()
    .focus()
    .command(({ tr }) => {
      tr.replaceWith(
        parentList.pos,
        parentList.pos + parentList.node.nodeSize,
        nextList,
      );
      return true;
    })
    .run();
}

function createConvertedList(node: ProseMirrorNode, target: ListTypes) {
  const items: ProseMirrorNode[] = [];

  node.forEach((child) => {
    items.push(
      target.item.createAndFill(
        getItemAttrs(child, target.item),
        child.content,
        child.marks,
      ) ?? target.item.create(getItemAttrs(child, target.item), child.content, child.marks),
    );
  });

  return target.list.create(getListAttrs(node, target.list), items, node.marks);
}

function findParentList(editor: Editor): ParentList | null {
  const { $from } = editor.state.selection;
  const listNames = Object.values(listTypesByKind).map((type) => type.list);

  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const node = $from.node(depth);

    if (listNames.includes(node.type.name as (typeof listNames)[number])) {
      return {
        node,
        pos: $from.before(depth),
      };
    }
  }

  return null;
}

function getListTypes(editor: Editor, kind: ListKind): ListTypes {
  const schema = editor.schema;
  const names = listTypesByKind[kind];

  return {
    item: schema.nodes[names.item],
    list: schema.nodes[names.list],
  };
}

function getItemAttrs(node: ProseMirrorNode, itemType: NodeType) {
  if (itemType.name === "taskItem") {
    return {
      checked: node.type.name === "taskItem" ? Boolean(node.attrs.checked) : false,
    };
  }

  return null;
}

function getListAttrs(node: ProseMirrorNode, listType: NodeType) {
  if (listType.name === "orderedList") {
    return {
      start: node.type.name === "orderedList" ? node.attrs.start : 1,
    };
  }

  return null;
}

function runToggleCommand(editor: Editor, kind: ListKind) {
  const command = listTypesByKind[kind].toggleCommand;

  editor.chain().focus()[command]().run();
}
