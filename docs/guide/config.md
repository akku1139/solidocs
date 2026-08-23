---
title: Configuration
order: 2
description: All configuration options for Solidocs
---

# Configuration

Solidocs is configured with a `solidocs.config.ts` file at your project root.

```ts
import { defineConfig } from "solidocs"

export default defineConfig({
  title: "My Site",
  description: "Document everything",
  basePath: "/",
})
```

## Options

### title

The site title, used in the header and as the document title suffix.

### description

The site description, used on home pages and as the meta description fallback.

### basePath

Deploy under a sub path, useful for GitHub Pages:

```ts
export default defineConfig({
  basePath: "/my-repo/",
})
```

All routes and assets are prefixed with this path.

## Frontmatter

Each page supports frontmatter options:

| Key | Description |
| --- | --- |
| `title` | Overrides the page title |
| `description` | Page description for the meta tag |
| `layout` | `home`, `doc` or `page` |

### layout: home

Renders a hero section instead of the doc layout — no sidebar or outline.
Use it for landing pages (`index.md`).

## Dark mode

The default theme ships with light/dark modes. The toggle in the header
stores the choice in `localStorage`; by default the theme follows the
visitor's system preference.

## Page order

Set `order` in a page's frontmatter to control its position in the global
navigation (sidebar, pager and home cards). Lower numbers come first;
pages without `order` follow alphabetically after the ordered ones.

```yaml
---
title: Configuration
order: 2
---
```
