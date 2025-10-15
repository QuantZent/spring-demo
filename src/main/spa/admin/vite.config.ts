import path from "node:path";
import { defineConfig } from "vitest/config";
import checker from "vite-plugin-checker";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

export default defineConfig({
  base: '/admin/',
  server: {
    hmr: true,
    port: 5173,
    strictPort: true
  },
  // publicDir: "public",
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react({
      jsxRuntime: "automatic",
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
    cssCodeSplit: true,
    sourcemap: process.env.NODE_ENV === "production",
    rollupOptions: {
      input: 'src/main.tsx',
      output: {
        entryFileNames: "assets/[name].[hash].js",
        chunkFileNames: "assets/[name].[hash].js",
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
