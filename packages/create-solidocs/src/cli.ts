/**
 * create-solidocs — scaffold a new Solidocs site.
 *
 *   npm create solidocs@latest my-site
 *
 * Options:
 *   --dir <path>    target directory (defaults to the name argument)
 *   --title <text>  site title
 *   --base-path /p/ base path for GitHub Pages style deploys
 *   --force         overwrite an existing directory
 */
import { parseArgs } from "node:util"
import * as fs from "node:fs/promises"
import * as path from "node:path"

interface ScaffoldOptions {
  dir: string
  title: string
  basePath: string
  description?: string
}

const slug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "my-solidocs-site"

/** Files written for every new site. `${title}` etc. are interpolated. */
const templates = (o: ScaffoldOptions): Array<[string, string]> => [
  [
    "package.json",
    JSON.stringify(
      {
        name: slug(o.title),
        version: "0.0.0",
        type: "module",
        private: true,
        scripts: {
          dev: "solidocs dev",
          build: "solidocs build",
          preview: "npx serve .solidocs/dist",
        },
        dependencies: {
          "@solidjs/router": "^1.0.0",
          solidocs: "^0.0.0",
          "solid-js": "^1.9.15",
        },
      },
      null,
      2,
    ) + "\n",
  ],
  [
    "tsconfig.json",
    JSON.stringify({ compilerOptions: { noEmit: true } }, null, 2) + "\n",
  ],
  [
    "solidocs.config.ts",
    `import { defineConfig } from "solidocs"

export default defineConfig({
  title: ${JSON.stringify(o.title)},
${o.description ? `  description: ${JSON.stringify(o.description)},\n` : ""}  basePath: ${JSON.stringify(o.basePath)},
})
`,
  ],
  [
    "index.md",
    `---
layout: home
description: ${o.description ?? "A Solidocs site"}
hero:
  name: ${o.title}
  text: Built with Solidocs
  tagline: Markdown in, static docs out.
  actions:
    - text: Get Started
      link: /guide/getting-started/
      theme: brand
---

# Welcome

Edit \`index.md\` to make this page yours.
`,
  ],
  [
    path.join("guide", "getting-started.md"),
    `---
title: Getting Started
order: 1
---

# Getting Started

Start the dev server:

\`\`\`bash
npm run dev
\`\`\`

Then edit the markdown files in this project.
`,
  ],
  ["public/.gitkeep", ""],
  [
    ".gitignore",
    "node_modules\n.solidocs\n",
  ],
]

const fail = (message: string): never => {
  console.error(`✗ ${message}`)
  process.exit(1)
}

export const create = async (argv: string[]): Promise<void> => {
  const { values, positionals } = parseArgs({
    args: argv,
    options: {
      dir: { type: "string" },
      title: { type: "string" },
      description: { type: "string" },
      "base-path": { type: "string" },
      force: { type: "boolean" },
      help: { type: "boolean" },
    },
    allowPositionals: true,
  })

  if(values.help) {
    console.log(`create-solidocs — scaffold a Solidocs site

Usage:
  npm create solidocs <name> [options]

Options:
  --dir <path>       target directory (defaults to <name>)
  --title <text>     site title (defaults to <name>)
  --description <t>  site description
  --base-path </p/>  base path (default "/")
  --force            write into a non-empty directory
  --help             show this help`)
    return
  }

  const name = positionals[0] ?? ""
  const dirArg = typeof values.dir === "string" ? values.dir : name
  if(!dirArg) fail("Please pass a project name: npm create solidocs my-site")

  const target = path.resolve(process.cwd(), dirArg)

  // Refuse to clobber an existing non-empty directory unless --force.
  let entries: string[] = []
  try {
    entries = await fs.readdir(target)
  } catch (error) {
    if((error as NodeJS.ErrnoException).code !== "ENOENT") throw error
  }
  if(entries.length > 0 && !values.force) {
    fail(`"${dirArg}" is not empty (found ${entries.length} entries). Pass --force to write anyway.`)
  }

  const title = typeof values.title === "string" && values.title
    ? values.title
    : path.basename(target)
  const rawBase = typeof values["base-path"] === "string" ? values["base-path"] : "/"
  const basePath =
    rawBase === "/" || rawBase === ""
      ? "/"
      : `/${rawBase.replace(/^\/+|\/+$/g, "")}/`

  const options: ScaffoldOptions = {
    dir: target,
    title,
    basePath,
    ...(typeof values.description === "string" ? { description: values.description } : {}),
  }

  await fs.mkdir(target, { recursive: true })
  for(const [relPath, content] of templates(options)) {
    const file = path.join(target, relPath)
    await fs.mkdir(path.dirname(file), { recursive: true })
    await fs.writeFile(file, content)
  }

  const relative = path.relative(process.cwd(), target) || "."
  console.log(`✓ Created your Solidocs site in ${relative}`)

  const pkgManager = process.env.npm_config_user_agent ?? ""
  const run = pkgManager.startsWith("pnpm") ? "pnpm" : pkgManager.startsWith("yarn") ? "yarn" : "npm"
  console.log(`
Next steps:
  cd ${relative}
  ${run === "npm" ? "npm install" : `${run} install`}
  ${run} run dev`)
}
