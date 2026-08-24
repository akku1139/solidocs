---
title: Getting Started
order: 1
description: Set up your first Solidocs site
---

# Getting Started

This guide walks you through setting up a Solidocs site from scratch.

## Requirements

- Node.js 24 or later
- pnpm 10

## Quick start

Scaffold a complete site with `create-solidocs`:

```bash
npm create solidocs@latest my-site
cd my-site
npm run dev
```

Options: `--title`, `--description`, `--base-path </path/>`, `--force`.

## Manual installation

Prefer setting things up by hand? Install the packages:

```bash
pnpm add solidocs solid-js @solidjs/router
```

## Project structure

A minimal Solidocs site looks like this:

```
my-site/
├── solidocs.config.ts
├── package.json
└── docs/
    ├── index.md
    └── guide/
        ├── getting-started.md
        └── config.md
```

Every `.md` file becomes a page. `guide/getting-started.md` is served at
`/guide/getting-started.html`.

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

See the [configuration guide](./config.html) for all options.

## Development

Start the dev server with live reload:

```bash
pnpm docs:dev
```

## Build

Generate the static site into `.solidocs/dist`:

```bash
pnpm docs:build
```

The output is fully static — deploy it to any static host or GitHub Pages.

## Next steps

- Configure your site via [configuration](./config.html)
