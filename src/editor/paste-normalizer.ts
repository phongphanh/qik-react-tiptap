import { Extension } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";

export interface PasteNormalizerOptions {
  allowedStyleProperties: string[];
}

const removableSelectors = [
  "script",
  "style",
  "meta",
  "link",
  "xml",
  "o\\:p",
  "w\\:sdt",
  "w\\:sdtpr",
  "w\\:sdtcontent",
];

const blockTags = new Set([
  "address",
  "article",
  "aside",
  "blockquote",
  "div",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "li",
  "p",
  "pre",
  "section",
  "td",
  "th",
]);

export const PasteNormalizer = Extension.create<PasteNormalizerOptions>({
  name: "pasteNormalizer",

  addOptions() {
    return {
      allowedStyleProperties: [
        "background-color",
        "color",
        "font-size",
        "margin-left",
        "text-align",
      ],
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          transformPastedHTML: (html) =>
            normalizePastedHTML(html, this.options),
          transformPastedText: normalizePastedText,
        },
      }),
    ];
  },
});

export function normalizePastedHTML(
  html: string,
  options: PasteNormalizerOptions,
) {
  if (!html.trim()) {
    return html;
  }

  const document = new DOMParser().parseFromString(html, "text/html");

  removeComments(document);
  removeElements(document);
  normalizeElements(document, options);
  removeEmptySpans(document);

  return document.body.innerHTML;
}

export function normalizePastedText(text: string) {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "");
}

function removeComments(document: Document) {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_COMMENT,
  );
  const comments: Node[] = [];

  while (walker.nextNode()) {
    comments.push(walker.currentNode);
  }

  for (const comment of comments) {
    comment.parentNode?.removeChild(comment);
  }
}

function removeElements(document: Document) {
  document.querySelectorAll(removableSelectors.join(",")).forEach((element) => {
    element.remove();
  });
}

function normalizeElements(
  document: Document,
  options: PasteNormalizerOptions,
) {
  document.body.querySelectorAll<HTMLElement>("*").forEach((element) => {
    const normalizedElement = normalizeElementName(element);

    normalizeWordListParagraph(normalizedElement);
    normalizeAttributes(normalizedElement, options);
  });
}

function normalizeElementName(element: HTMLElement) {
  const tagName = element.tagName.toLowerCase();

  if (tagName === "b") {
    return replaceElement(element, "strong");
  }

  if (tagName === "i") {
    return replaceElement(element, "em");
  }

  return element;
}

function normalizeAttributes(
  element: HTMLElement,
  options: PasteNormalizerOptions,
) {
  for (const attribute of Array.from(element.attributes)) {
    const name = attribute.name.toLowerCase();

    if (name === "href" || name === "src" || name === "colspan" || name === "rowspan") {
      continue;
    }

    if (name === "style") {
      normalizeStyle(element, options.allowedStyleProperties);
      continue;
    }

    if (name.startsWith("data-") && name !== "data-indent") {
      element.removeAttribute(attribute.name);
      continue;
    }

    if (
      name === "class" ||
      name === "id" ||
      name === "lang" ||
      name === "dir" ||
      name.startsWith("mso-") ||
      name.startsWith("v:") ||
      name.startsWith("o:") ||
      name.startsWith("w:")
    ) {
      element.removeAttribute(attribute.name);
    }
  }

  if (element.tagName.toLowerCase() === "a") {
    element.removeAttribute("target");
    element.removeAttribute("rel");
  }
}

function normalizeStyle(element: HTMLElement, allowedProperties: string[]) {
  const nextStyles: string[] = [];

  for (const property of allowedProperties) {
    const value = element.style.getPropertyValue(property).trim();

    if (!value || value.includes("mso-")) {
      continue;
    }

    if (property === "margin-left") {
      const indent = parseMarginIndent(value);

      if (indent > 0) {
        element.setAttribute("data-indent", String(indent));
      }

      if (!blockTags.has(element.tagName.toLowerCase())) {
        continue;
      }
    }

    nextStyles.push(`${property}: ${value}`);
  }

  if (nextStyles.length) {
    element.setAttribute("style", nextStyles.join("; "));
  } else {
    element.removeAttribute("style");
  }
}

function normalizeWordListParagraph(element: HTMLElement) {
  if (element.tagName.toLowerCase() !== "p") {
    return;
  }

  const style = element.getAttribute("style") ?? "";

  if (!/mso-list/i.test(style)) {
    return;
  }

  const text = element.textContent ?? "";
  element.textContent = text.replace(/^\s*[\u2022·o]\s+/, "");
}

function removeEmptySpans(document: Document) {
  document.body.querySelectorAll("span").forEach((span) => {
    if (span.attributes.length || span.childNodes.length === 0) {
      return;
    }

    span.replaceWith(...Array.from(span.childNodes));
  });
}

function replaceElement(element: HTMLElement, tagName: string) {
  const next = element.ownerDocument.createElement(tagName);

  for (const attribute of Array.from(element.attributes)) {
    next.setAttribute(attribute.name, attribute.value);
  }

  next.append(...Array.from(element.childNodes));
  element.replaceWith(next);

  return next;
}

function parseMarginIndent(value: string) {
  const match = value.match(/^([\d.]+)(px|pt|rem|em)$/i);

  if (!match) {
    return 0;
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const pixels =
    unit === "pt"
      ? amount * (4 / 3)
      : unit === "rem" || unit === "em"
        ? amount * 16
        : amount;

  return Math.min(Math.max(Math.round(pixels / 24), 0), 20);
}
