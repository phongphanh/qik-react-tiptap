import * as React from "react";

export type SimpleEditorTheme = "light" | "dark" | "system";

const EditorThemeContext = React.createContext<SimpleEditorTheme>("system");

export function EditorThemeProvider({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme: SimpleEditorTheme;
}) {
  return (
    <EditorThemeContext.Provider value={theme}>
      {children}
    </EditorThemeContext.Provider>
  );
}

export function useEditorTheme() {
  return React.useContext(EditorThemeContext);
}

export function getThemeAttribute(theme: SimpleEditorTheme) {
  return theme === "system" ? undefined : theme;
}
