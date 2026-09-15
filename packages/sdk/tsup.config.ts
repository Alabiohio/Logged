import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    dts: true,
    clean: true,
  },
  {
    entry: ["src/logged.ts"],
    format: ["iife"],
    // Keep the IIFE wrapper separate from the public constructor. The browser
    // entry assigns the class itself to `window.Logged`; using the same name
    // here causes esbuild to overwrite that class with its exports object.
    globalName: "LoggedBundle",
    minify: true,
    outDir: "dist",
  },
]);
