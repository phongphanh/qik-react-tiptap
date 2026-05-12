# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # start Vite dev server (renders src/demo.tsx)
pnpm build        # compile library: tsc -p tsconfig.build.json && node scripts/copy-css.mjs
pnpm typecheck    # type-check without emitting
```

There is no test suite.

## Architecture

This is a publishable React library (`react-tiptap-shadcn`) — a Tiptap 3 rich-text editor with shadcn/Radix UI primitives. The public API is exported from `src/index.ts`.

### Key layers

**`src/simple-editor.tsx`** — the single exported editor component. It wires together the Tiptap `useEditor` hook, three toolbar hooks, and renders four child components: `EditorToolbar` (sticky top bar), `EditorContent`, `FloatingToolbar` (appears on text selection), and `LinkToolbar` (appears on link click/selection).

**`src/editor/`**
- `extensions.ts` — `createSimpleEditorExtensions()` configures all Tiptap extensions (StarterKit + Underline, TextStyle, Color, Highlight, Link, Image, TaskList/Item, TextAlign, Placeholder). Exported so consumers can build custom editors with the same extension set.
- `link-events.ts` — prevents in-editor link navigation while editing; `selectClickedLink` selects the full link mark on click.
- `file.ts` — `fileToDataUrl` fallback for image uploads when no `onImageUpload` prop is provided.

**`src/toolbar/`**
- `types.ts` — all TypeScript interfaces (`ToolbarButtonDefinition`, `ToolbarGroupDefinition`, `ColorPaletteDefinition`, `ToolbarState`, etc.).
- `definitions.tsx` — data-driven toolbar config: `toolbarGroups` (arrays of `ToolbarButtonDefinition`), `blockItems`, `listItems`, `colorPalettes`. Adding a new toolbar button means adding an entry here.
- `use-toolbar-state.ts` — `useEditorState` selector that maps editor state → `ToolbarState` (active/disabled maps + current block label). Recalculates on every editor transaction.
- `use-floating-toolbar.ts` — tracks text selection to compute `{ left, top }` for the floating toolbar; hides on pointer-down outside toolbar elements.
- `use-link-toolbar.ts` — detects link clicks and selection-within-link to show the link edit popover; also hides on pointer-down outside.
- `dom.ts` — `isToolbarInteractionTarget` helper used by both floating hooks to ignore pointer events on toolbar elements.

**`src/ui/`** — thin shadcn-style wrappers around Radix UI primitives (Button, Popover, Tooltip, DropdownMenu, Separator, Input). Add new primitives here when needed (use `components.json` / shadcn CLI with alias `@/lib/utils`).

### CSS

- `src/styles.css` — the **published** stylesheet. All editor-specific classes use the `rt-` prefix (e.g., `rt-editor-shell`, `rt-prose`, `rt-floating-toolbar`). Imported by consumers as `react-tiptap-shadcn/style.css`.
- `src/tailwind.css` — Tailwind v4 entry, dev-only (not published).
- `scripts/copy-css.mjs` — post-build step that copies `src/styles.css` → `dist/style.css` because Vite lib mode does not process the CSS file separately.

### Build

- `tsconfig.build.json` extends `tsconfig.json` but includes only library source (`src/index.ts`, `src/simple-editor.tsx`, `src/editor/**`, `src/toolbar/**`, `src/ui/**`) — `src/demo.tsx` and `src/demo.css` are excluded.
- Vite outputs a single ESM bundle (`dist/index.js`). All Tiptap packages and React are external.
- Type declarations are emitted alongside JS into `dist/`.

### shadcn integration

- `components.json` targets `src/ui/` with alias `@` → `src/`.
- Use the shadcn CLI to add new Radix-backed components into `src/ui/`.
