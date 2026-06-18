import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { metaImagesPlugin } from "./vite-plugin-meta-images";

/**
 * Dev-only middleware: requests to /pay/<anything> or /benefits/<anything>
 * that aren't actual static files should fall back to /<section>/index.html,
 * so the static SPAs (Pay's React build, Benefits' static report) can handle
 * client-side routing under their base path. Mirrors the Vercel rewrites.
 */
const staticSpaFallback = (): PluginOption => ({
  name: "static-spa-fallback",
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      const url = req.url || "";
      const [pathOnly] = url.split("?");
      // Skip requests that look like assets (any extension after the last "/").
      if (/\/[^/]+\.[a-z0-9]+$/i.test(pathOnly)) return next();
      if (pathOnly === "/pay" || pathOnly.startsWith("/pay/")) {
        req.url = "/pay/index.html";
      } else if (pathOnly === "/benefits" || pathOnly.startsWith("/benefits/")) {
        req.url = "/benefits/index.html";
      }
      next();
    });
  },
});

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    tailwindcss(),
    metaImagesPlugin(),
    staticSpaFallback(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  css: {
    postcss: {
      plugins: [],
    },
  },
  base: process.env.GITHUB_PAGES === "true" ? "/Dashboard/" : "/",
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
