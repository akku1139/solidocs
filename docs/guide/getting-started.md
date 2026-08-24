---
title: Getting Started
order: 10
description: Set up your first Solidocs site
---

# Getting Started

Solidocs is a static site generator powered by SolidJS and Rolldown.
Write markdown (or MDX), get a fully prerendered documentation site.

## Requirements

- Node.js 24 or later
- A package manager — npm, pnpm or yarn

## Quick start

Scaffold a complete site with `create-solidocs`:

```bash
npm create solidocs@latest my-site
cd my-site
npm run dev
```

The dev server starts on `http://localhost:3000` with live reload.

Options:

| Option | Description |
| --- | --- |
| `--title <text>` | Site title |
| `--description <text>` | Site description |
| `--base-path </path/>` | Deploy under a sub path |
| `--force` | Write into a non-empty directory |

## Manual installation

Prefer setting things up by hand? Install the packages:

```bash
pnpm add solidocs solid-js @solidjs/router
```

## Project structure

A minimal Solidocs site looks like this:

```
my-site/
├── solidocs.config.ts     # site configuration
├── package.json
└── docs/                  # every .md file becomes a page
    ├── index.md           # → /
    └── guide/
        ├── getting-started.md
        └── config.md
```

## Configuration

Create a `solidocs.config.ts`:

```ts
import { defineConfig } from "solidocs"

export default defineConfig({
  title: "My Site",
  description: "My site description",
  basePath: "/",
})
```

See the [configuration guide](./config.html) for all options,
including header customization via `themeConfig`.

## Development & build

```bash
# Dev server with live reload
pnpm run dev

# Static build into .solidocs/dist
pnpm run build
```

The output is fully static — deploy it to any static host. See
[deployment](./deploy.html) for GitHub Pages specifics.

## Next steps

- [Configuration](./config.html) — all config and frontmatter options
- [MDX](./mdx.html) — components inside markdown
- [Deployment](./deploy.html) — publish your site
