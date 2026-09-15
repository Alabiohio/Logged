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
    globalName: "Logged",
    minify: true,
    outDir: "dist",
    footer: {
      js: "if(typeof window!=='undefined'&&window.Logged){window.Logged=window.Logged.default||window.Logged.Logged||window.Logged;}",
    },
  },
]);
