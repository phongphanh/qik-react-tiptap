import { createRoot } from "react-dom/client";
import { SimpleEditor } from "./simple-editor";
import "./tailwind.css";
import "./styles.css";
import "./demo.css";

import React from "react";

function Demo() {
  return (
    <main className="demo-shell">
      <SimpleEditor />
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Demo />
  </React.StrictMode>,
);
