# hydrawn-site

The showcase site for [Hydrawn](https://github.com/Univers42/hydrawn), the free whiteboard
you can share privately. Astro (static) with React islands, Motion and Tailwind. The host
has no Node: everything runs in Docker through `make`.

| Command       | What it does                                                               |
| ------------- | -------------------------------------------------------------------------- |
| `make dev`    | Hot-reloading dev server on http://localhost:4321                          |
| `make check`  | The gate: `astro check`, `eslint --max-warnings 0`, `prettier --check`     |
| `make format` | Rewrites files the way `prettier --check` wants them                       |
| `make build`  | Static build into `dist/`                                                  |
| `make up`     | Builds the production image (Caddy) and serves it on http://localhost:8321 |
| `make public` | Also serves it on a temporary `https://….trycloudflare.com` address        |
| `make down`   | Stops it, and the temporary address with it                                |

Every push to `main` that passes `make check` publishes the same image, so it also runs
without a checkout: `docker run -p 8321:8080 ghcr.io/univers42/hydrawn-site:latest`.

## Where it is served

- **https://hydrawn.pages.dev**: Cloudflare Pages (project `hydrawn`), deployed by
  `.github/workflows/pages.yml` on every push to `main` that passes `make check`. It needs
  the secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`; the variable
  `PUBLIC_APP_URL` says where the app is. `public/_headers` sets its headers.
- **The image**: `.github/workflows/image.yml` publishes `ghcr.io/univers42/hydrawn-site`.
- **A temporary address**: `make public`, from this computer.

Dependencies follow the app's rule: nothing younger than 7 days is installed
(`minimumReleaseAge` in `pnpm-workspace.yaml`).

## Where things are

- `src/lib/mark.ts`: the logo, built as SVG from one source for every size. `/brand/`
  shows it at every size, on light and dark.
- `public/media/`: real recordings of the app (mp4, webm and a webp poster each), made
  with Playwright and encoded with ffmpeg.
- `public/og.png`, `public/apple-touch-icon.png`: screenshots of `/og-card/`; re-render
  them after changing the mark.
- `src/components/magicui/animated-beam.tsx`: Magic UI's AnimatedBeam (MIT), vendored.
