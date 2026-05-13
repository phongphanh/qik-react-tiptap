import { Extension, type CommandProps } from "@tiptap/core";

export interface IndentOptions {
  types: string[];
  minLevel: number;
  maxLevel: number;
  size: number;
  unit: "em" | "rem" | "px";
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    indent: {
      setIndent: (level: number) => ReturnType;
      indent: () => ReturnType;
      outdent: () => ReturnType;
    };
  }
}

export const Indent = Extension.create<IndentOptions>({
  name: "indent",

  addOptions() {
    return {
      types: ["paragraph", "heading", "blockquote", "listItem", "taskItem"],
      minLevel: 0,
      maxLevel: 20,
      size: 1.5,
      unit: "rem",
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          indent: {
            default: 0,
            parseHTML: (element) =>
              parseIndentLevel(element, this.options.size, this.options.unit),
            renderHTML: (attributes) => {
              const level = normalizeIndentLevel(
                attributes.indent,
                this.options.minLevel,
                this.options.maxLevel,
              );

              if (!level) {
                return {};
              }

              return {
                "data-indent": String(level),
                style: `margin-left: ${level * this.options.size}${this.options.unit}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setIndent:
        (level) =>
        (props) =>
          updateSelectedIndent(props, this.options, () => level),
      indent:
        () =>
        (props) =>
          updateSelectedIndent(
            props,
            this.options,
            (current) => current + 1,
          ),
      outdent:
        () =>
        (props) =>
          updateSelectedIndent(
            props,
            this.options,
            (current) => current - 1,
          ),
    };
  },

  addKeyboardShortcuts() {
    return {
      Tab: () => this.editor.commands.indent(),
      "Shift-Tab": () => this.editor.commands.outdent(),
      "Mod-]": () => this.editor.commands.indent(),
      "Mod-[": () => this.editor.commands.outdent(),
    };
  },
});

function updateSelectedIndent(
  { dispatch, state, tr }: CommandProps,
  options: IndentOptions,
  nextLevel: (currentLevel: number) => number,
) {
  const { from, to } = state.selection;
  let changed = false;

  state.doc.nodesBetween(from, to, (node, pos) => {
    if (!options.types.includes(node.type.name)) {
      return true;
    }

    const current = normalizeIndentLevel(
      node.attrs.indent,
      options.minLevel,
      options.maxLevel,
    );
    const next = normalizeIndentLevel(
      nextLevel(current),
      options.minLevel,
      options.maxLevel,
    );

    if (next !== current) {
      tr.setNodeMarkup(pos, undefined, {
        ...node.attrs,
        indent: next,
      });
      changed = true;
    }

    if (node.type.name === "listItem" || node.type.name === "taskItem") {
      return false;
    }

    return true;
  });

  if (!changed) {
    return false;
  }

  if (dispatch) {
    dispatch(tr);
  }

  return true;
}

function normalizeIndentLevel(value: unknown, minLevel: number, maxLevel: number) {
  const level = Number(value);

  if (!Number.isFinite(level)) {
    return minLevel;
  }

  return Math.min(Math.max(Math.round(level), minLevel), maxLevel);
}

function parseIndentLevel(
  element: HTMLElement,
  size: number,
  unit: IndentOptions["unit"],
) {
  const dataIndent = element.getAttribute("data-indent");

  if (dataIndent) {
    return normalizeIndentLevel(dataIndent, 0, Number.MAX_SAFE_INTEGER);
  }

  const marginLeft = element.style.marginLeft;
  const match = marginLeft.match(/^([\d.]+)(em|rem|px)$/);

  if (!match || match[2] !== unit) {
    return 0;
  }

  return normalizeIndentLevel(Number(match[1]) / size, 0, Number.MAX_SAFE_INTEGER);
}
