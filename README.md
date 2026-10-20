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
  `.github/workflows/release.yml`. It needs the secrets `CLOUDFLARE_API_TOKEN` and
  `CLOUDFLARE_ACCOUNT_ID`. The app's address is `src/lib/app.ts`; a repository variable
  `PUBLIC_APP_URL` overrides it. `public/_headers` sets its headers.
- **A preview per pull request** at `https://pr-<number>.hydrawn.pages.dev`, linked from
  the pull request and rebuilt on every push to it.
- **hydrawn.eu.org** (requested, awaiting eu.org's approval): the zone is in Cloudflare
  with `hydrawn.eu.org` → `hydrawn.pages.dev` and `app.hydrawn.eu.org` →
  `hydrawn-app.pages.dev`, both attached to their Pages projects. Once it is approved,
  point `site` (`astro.config.mjs`) and `APP_URL` (`src/lib/app.ts`) at it.
- **The image**: `.github/workflows/image.yml` publishes `ghcr.io/univers42/hydrawn-site`.
- **A temporary address**: `make public`, from this computer.

Dependencies follow the app's rule: nothing younger than 7 days is installed
(`minimumReleaseAge` in `pnpm-workspace.yaml`).

## Releasing

Every change goes through a pull request; merge it with **squash**, so its title becomes
the commit on `main`. Each merge is a release: `release.yml` passes `make check`, tags the
next version from that title (`feat…` → minor, a `!` → major, anything else → patch),
publishes a GitHub release listing the pull requests, and deploys the site.

## Where things are

- `src/lib/mark.ts`: the logo, built as SVG from one source for every size. `/brand/`
  shows it at every size, on light and dark.
- `public/media/`: real recordings of the app (mp4, webm and a webp poster each), made
  with Playwright and encoded with ffmpeg.
- `public/og.png`, `public/apple-touch-icon.png`: screenshots of `/og-card/`; re-render
  them after changing the mark.
- `src/components/magicui/animated-beam.tsx`: Magic UI's AnimatedBeam (MIT), vendored.
