import { glob } from "glob";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import checker from "vite-plugin-checker";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

export default defineConfig({
  // root: __dirname,
  // base: '',
  server: {
    hmr: true,
    // origin: 'http://localhost:5173',
  },
  // publicDir: "public",
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    tsconfigPaths(),
    checker({
      typescript: true,
    }),
  ],
  build: {
    target: "ES2020",
    minify: "esbuild",
    cssCodeSplit: false,
    sourcemap: process.env.NODE_ENV === "production",
    rollupOptions: {
      input: Object.fromEntries(
        glob
          .sync("./src/**/*.{ts,tsx,js,jsx}", { ignore: "./src/**/*.d.ts" })
          .map((file) => [
            // This remove `src/` as well as the file extension from each
            // file, so e.g. src/nested/foo.js becomes nested/foo
            path.relative(
              "src",
              file.slice(0, file.length - path.extname(file).length),
            ),
            // This expands the relative paths to absolute paths, so e.g.
            // src/nested/foo becomes /project/src/nested/foo.js
            fileURLToPath(new URL(file, import.meta.url)),
          ]),
      ),
      output: {
        entryFileNames: "[hash].js",
        dir: path.resolve(__dirname, "../../resources/static/admin"),
        assetFileNames: "assets/[name].[hash][extname]",
      },
    },
    manifest: true,
    emptyOutDir: true,
    outDir: path.resolve(__dirname, "../../resources/static/admin"),
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./vitest.setup.mjs",
  },
});
