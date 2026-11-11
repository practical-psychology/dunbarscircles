import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { execSync } from "child_process";

/** Git SHA of this build, exposed as <meta name="build-sha"> (RELEASE.md). */
function buildSha(): string {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA;
  try {
    const sha = execSync("git rev-parse HEAD", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
    const dirty = execSync("git status --porcelain", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
    return dirty ? `${sha}-dirty` : sha;
  } catch {
    return "unknown";
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: "build-sha-meta",
      transformIndexHtml: () => [
        {
          tag: "meta",
          attrs: { name: "build-sha", content: buildSha() },
          injectTo: "head",
        },
      ],
    },
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          firebase: ["firebase/app", "firebase/auth", "firebase/firestore"],
          motion: ["framer-motion"],
        },
      },
    },
  },
});
