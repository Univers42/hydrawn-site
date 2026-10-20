import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// The dev server runs in a container against a bind mount, where file events do not
// cross reliably; polling is opt-in for that case only.
const usePolling = process.env.SITE_USE_POLLING === "1";

export default defineConfig({
  site: "https://hydrawn.js.org",
  // The toolbar floats over the page being designed; the live preview is for looking at it.
  devToolbar: { enabled: false },
  integrations: [react(), sitemap({ filter: (page) => !page.includes("/og-card") })],
  vite: {
    plugins: [tailwindcss()],
    server: { watch: usePolling ? { usePolling: true, interval: 300 } : undefined },
  },
});
