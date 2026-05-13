import type { Editor } from "@tiptap/core";
import type { ComponentType, ReactNode } from "react";
import type { LucideProps } from "lucide-react";

export type ToolbarIcon = ComponentType<LucideProps>;

export type ToolbarCommand = (editor: Editor) => void;
export type ToolbarPredicate = (editor: Editor) => boolean;

export interface ToolbarButtonDefinition {
  id: string;
  label: string;
  icon: ToolbarIcon;
  command: ToolbarCommand;
  isActive?: ToolbarPredicate;
  isDisabled?: ToolbarPredicate;
}

export interface ToolbarDropdownItem {
  id: string;
  label: string;
  icon: ToolbarIcon;
  command: ToolbarCommand;
  isActive?: ToolbarPredicate;
}

export interface ToolbarGroupDefinition {
  id: string;
  items: ToolbarButtonDefinition[];
}

export interface ColorPaletteDefinition {
  id: string;
  label: string;
  icon: ReactNode;
  colors: string[];
  command: (editor: Editor, color: string) => void;
  clear: ToolbarCommand;
  isActive?: ToolbarPredicate;
}

export interface ToolbarState {
  active: Record<string, boolean>;
  activeListId?: string;
  characterCount: number;
  disabled: Record<string, boolean>;
  currentBlockLabel: string;
  currentFontSize: string | null;
}
