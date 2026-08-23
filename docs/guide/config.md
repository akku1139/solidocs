---
title: Configuration
---

# Configuration

Solidocs is configured with a `solidocs.config.ts` file.

## Options

### title

The site title, used in the header and the document title.

### basePath

Deploy under a sub path, useful for GitHub Pages:

```ts
export default defineConfig({
  basePath: "/my-repo/",
})
```

## Frontmatter

Each page supports frontmatter options:

| Key | Description |
| --- | --- |
| `title` | Overrides the page title |
| `description` | Page description for the meta tag |
| `layout` | `home`, `doc` or `page` |
