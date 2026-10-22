# App Shipyard website

Next.js site for App Shipyard. Version 1.2.0. `next build` writes a static `out/` directory because `output` is `export` in `next.config.ts`.

## Local

```bash
npm ci
npm run build
```

The postbuild script checks `out/` for gradients, shadows, and external font or script hosts. Expected: a line that starts with `checked`.

`npm run dev` starts the dev server. `npm run preview` serves `out/` after a build.

## Vercel

Create the project from this repository and set **Root Directory** to `website`. The install and build commands are in `vercel.json`: `npm ci` and `npm run build`.

Set `NEXT_PUBLIC_SITE_URL` to the public origin, including `https://`, with no trailing slash. If that variable is unset, the build uses `VERCEL_PROJECT_PRODUCTION_URL` or `VERCEL_URL` when Vercel provides one, and otherwise `http://localhost:3000`.

Do not deploy from the repository root. The Next app is this directory, and it has its own `package-lock.json`.
