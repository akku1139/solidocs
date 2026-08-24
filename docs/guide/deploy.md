---
title: Deployment
order: 50
description: Publish your Solidocs site
---

# Deployment

`solidocs build` produces a fully static site in `.solidocs/dist`.
Any static file host works — no server-side runtime needed.

## GitHub Pages

Solidocs itself is deployed this way. The workflow:

```yaml
name: Docs

on:
  push:
    branches: [main]

permissions:
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install -g corepack@latest && corepack enable pnpm
      - uses: actions/setup-node@v4
        with:
          node-version: 24.x
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - name: Build docs
        run: pnpm run docs
      - uses: actions/upload-pages-artifact@v3
        with:
          path: docs/.solidocs/dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
    steps:
      - uses: actions/deploy-pages@v4
```

### Base path

Project sites are served from `https://<user>.github.io/<repo>/`, so
set the base path accordingly:

```ts
export default defineConfig({
  basePath: "/my-repo/",
})
```

All routes, assets and internal links are prefixed automatically.

## Other hosts

| Host | Notes |
| --- | --- |
| Netlify / Vercel | Build command `solidocs build`, output dir `.solidocs/dist` |
| Cloudflare Pages | Same as above; set the output dir in the dashboard |
| Any static server | Upload `.solidocs/dist` as-is |

## Previewing the build

```bash
npx serve .solidocs/dist
```

Note that directory-style urls (`/guide/foo/`) map to
`guide/foo.html`; hosts that serve static files handle this out of
the box.
