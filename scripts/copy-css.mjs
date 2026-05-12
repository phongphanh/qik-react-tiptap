import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));

await mkdir(resolve(rootDir, "dist"), { recursive: true });
await copyFile(resolve(rootDir, "src/styles.css"), resolve(rootDir, "dist/style.css"));
