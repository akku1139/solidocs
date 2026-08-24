---
title: MDX
order: 40
description: Components and JSX inside your markdown
---

# MDX

Every `.md` file is compiled as MDX, so markdown can embed real
Solid components. Files with a `.mdx` extension work the same way —
use whichever extension you prefer.

## Using components

Import a component and use it like JSX:

```mdx
import { Counter } from "./Counter.tsx"

<Counter start={10} />
```

The component runs on the server during prerendering **and** hydrates
in the browser, so interactive components just work.

## Standard markdown still applies

Everything else behaves like normal markdown — headings, lists,
tables, fenced code blocks (highlighted with Shiki) and frontmatter.

## Frontmatter

Frontmatter must be the first thing in the file:

```yaml
---
title: My page
description: Shown in meta tags
layout: doc       # or "home" for a landing page
hero:             # only used with layout: home
  name: Solidocs
  text: ...
  actions:
    - text: Get Started
      link: /guide/getting-started/
      theme: brand
---
```

See [configuration](./config.html) for the full list of frontmatter
options.

## Notes & gotchas

- The frontmatter block is stripped from the rendered output — it is
  metadata, not content.
- Heading ids are generated automatically (GitHub-style slugs), which
  is what the right-hand outline links to.
- Keep JSX valid: self-close component tags (`<MyThing />`), and
  remember that `<`, `>` and `{` in prose may need escaping.
