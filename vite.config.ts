import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const repositoryName = "fake-break";
const productionUrl = `https://gobang5.github.io/${repositoryName}`;

export default defineConfig(({ command }) => {
  const isBuild = command === "build";

  return {
    // Relative asset paths: the built site works from GitHub Pages,
    // any sub-path static host, or a local folder server alike.
    base: isBuild ? "./" : "/",
    build: {
      outDir: "docs",
    },
    plugins: [
      react(),
      {
        name: "fake-break-site-url",
        transformIndexHtml(html) {
          return html.replaceAll(
            "__SITE_URL__",
            isBuild ? productionUrl : "http://localhost:5173/",
          );
        },
      },
    ],
  };
});
