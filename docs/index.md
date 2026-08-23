---
layout: home
description: SolidJS + Rolldown powered static site generator
hero:
---

# Solidocs

SolidJS + Rolldown powered static site generator.

## Quick start

Create a new project and install solidocs:

```bash
pnpm add solidocs
```

Create a `solidocs.config.ts`:

```ts
import { defineConfig } from "solidocs"

export default defineConfig({
  title: "My Site",
  basePath: "/",
})
```

Then write markdown files. Every `.md` file becomes a page.
