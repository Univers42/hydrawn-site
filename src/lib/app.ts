// Where every "Start drawing" link goes. The real address, unless the build is given another
// one: `PUBLIC_APP_URL=https://….trycloudflare.com make up` points the site at an app served
// from somewhere else, such as a temporary tunnel.
const fromBuild: string | undefined = import.meta.env.PUBLIC_APP_URL;

// app.hydrawn.eu.org once eu.org has approved hydrawn.eu.org (see astro.config.mjs).
export const APP_URL = fromBuild || "https://hydrawn-app.pages.dev";
