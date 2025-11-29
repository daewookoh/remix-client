import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import { vercelPreset } from "@vercel/remix/vite";
import path from "path";

installGlobals();

export default defineConfig({
  plugins: [
    remix({
      presets: [vercelPreset()],
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./app"),
    },
  },
  server: {
    middlewareMode: false,
    proxy: {},
  },
  // Suppress Chrome DevTools and other development-only errors
  customLogger: {
    ...console,
    error: (...args) => {
      const msg = args.join(' ');
      // Suppress Chrome DevTools requests
      if (msg.includes('.well-known/appspecific/com.chrome')) {
        return;
      }
      console.error(...args);
    },
  },
});
