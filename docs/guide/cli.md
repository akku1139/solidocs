---
title: CLI
order: 30
description: The solidocs CLI and its command line options
---

# CLI

The `solidocs` package ships two commands:

```bash
solidocs dev     # dev server with live reload
solidocs build   # static build into .solidocs/dist
```

## Overriding the config

Every option from `solidocs.config.ts` can be overridden on the
command line. Overrides are merged into the file config and validated
together, so both must satisfy the schema.

```bash
solidocs build --title "Staging Docs" --base-path /preview/
```

| Flag | Config key | Notes |
| --- | --- | --- |
| `--config <path>` | — | Use a different config file |
| `--title <text>` | `title` | Site title |
| `--description <text>` | `description` | Meta description |
| `--lang <code>` | `lang` | Document language |
| `--base-path </p/>` | `basePath` | Normalized to leading/trailing slashes |

## Dev server

```bash
solidocs dev
```

- Serves the site at `http://localhost:3000` (plus your base path)
- Rebuilds on every file change
- Live reloads connected browsers over SSE (`/_dev/reload`)

## Build

```bash
solidocs build
```

- Prerenders every page to static HTML in `.solidocs/dist`
- Emits hashed client bundles and assets next to it
- Output is deployable to any static host

## npm scripts

The scaffolded `package.json` wires them up:

```json
{
  "scripts": {
    "dev": "solidocs dev",
    "build": "solidocs build"
  }
}
```
