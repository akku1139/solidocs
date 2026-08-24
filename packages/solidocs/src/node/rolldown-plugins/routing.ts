import * as fs from "node:fs/promises"
import { execFileSync } from "node:child_process"
import type { Plugin } from "rolldown"
import { p, rootPath } from "../utils/path.ts"
import * as path from "node:path"
import {
  deriveTitle,
  extractFrontmatter,
  extractOutline,
} from "../utils/markdown.ts"
import type { ParsedConfig } from "../utils/config.ts"
import type { PageMeta } from "../../shared/types.ts"

export type Routes = Array<[string, string]>

/**
 * Last-commit time (ISO) for every tracked markdown file, in one git
 * call. Untracked files and non-git directories simply come back
 * without an entry.
 */
let gitRoot: string = rootPath
const lastCommitTimes = (files: string[]): Map<string, string> => {
  const times = new Map<string, string>()
  if(files.length === 0) return times
  try {
    gitRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
      cwd: rootPath,
      stdio: ["ignore", "pipe", "ignore"],
    }).toString().trim()
    const out = execFileSync(
      "git",
      ["log", "--format=%ct", "--name-only"],
      { cwd: rootPath, stdio: ["ignore", "pipe", "ignore"], maxBuffer: 16 * 1024 * 1024 },
    ).toString()
    let currentTime: string | undefined
    for(const line of out.split("\n")) {
      if(line === "") continue
      if(/^\d+$/.test(line)) {
        // git log walks newest-first; remember which commit we are in.
        currentTime = new Date(Number(line) * 1000).toISOString()
        continue
      }
      if(currentTime && !times.has(line)) times.set(line, currentTime)
    }
  } catch {
    // not a git repo — leave everything without a timestamp
  }
  return times
}

/** All pages with resolved metadata, sorted by path. */
export const getPages = async (): Promise<PageMeta[]> => {
  const srcs = await Array.fromAsync(fs.glob("./**/*.md", { exclude: ["./node_modules", "./.solidocs"] }))

  // One git invocation for the whole site.
  const commitTimes = lastCommitTimes(srcs)

  const pages = await Promise.all(srcs.map(async src => {
    const source = await fs.readFile(p(src), "utf8")
    const { data, body } = extractFrontmatter(source)
    if(data.lastUpdated === undefined) {
      // git reports paths relative to the repository root; the site
      // may live in a sub directory of it.
      const absolute = path.resolve(rootPath, src)
      const repoRelative = path.relative(gitRoot, absolute)
      const updated = commitTimes.get(absolute) ?? commitTimes.get(repoRelative)
        ?? commitTimes.get(src)
      if(updated) data.lastUpdated = updated
    }
    const route = ("/" + src.replace(/\.md$/, "").replace(/\/?index$/, "") + "/").replaceAll(/\/+/g, "/")
    return {
      path: route,
      src,
      frontmatter: data,
      title: deriveTitle(body, src, data),
      outline: extractOutline(body),
    } satisfies PageMeta
  }))

  // Global nav order: explicit frontmatter `order` first (lower comes
  // first), then alphabetical by route path.
  return pages.sort((a, b) => {
    const oa = a.frontmatter.order ?? Number.POSITIVE_INFINITY
    const ob = b.frontmatter.order ?? Number.POSITIVE_INFINITY
    if(oa !== ob) return oa - ob
    return a.path.localeCompare(b.path)
  })
}

export const routingPlugin = (options: {
  config: ParsedConfig,
  pages: PageMeta[],
  /** Direct component references for SSR prerendering (no lazy loading). */
  ssr?: boolean,
}): Plugin => ({
  name: "solidocs-routing",
  resolveId(src) {
    if(src === "solidocs:routes") return "\0" + src
    if(src === "solidocs:basepath" || src === "solidocs:site") return "\0" + src
    return
  },
  load(id) {
    if(id === "\0solidocs:routes") {
      // During SSR prerendering all chunks are inlined, so lazy loading
      // only delays the first render past what renderToStringAsync waits
      // for (empty articles). Static imports keep prerendering reliable.
      const ssr = options.ssr === true
      const routes = options.pages.map((page, i) => {
        const component = ssr
          ? `Page${i}`
          : `lazy(() => import(${JSON.stringify(p(page.src))}))`
        return `{
        path: ${JSON.stringify(page.path)},
        title: ${JSON.stringify(page.title)},
        frontmatter: ${JSON.stringify(page.frontmatter)},
        outline: ${JSON.stringify(page.outline)},
        component: ${component},
      }`
      })
      const imports = ssr
        ? options.pages.map((page, i) => `import Page${i} from ${JSON.stringify(p(page.src))}`).join("\n")
        : `import { lazy } from "solid-js"`
      return {
        moduleType: "js",
        code: `
          ${imports}
          export default [ ${routes.join(",")} ]
        `,
      }
    }
    if(id === "\0solidocs:basepath") {
      return {
        moduleType: "js",
        code: `export default ${JSON.stringify(options.config.basePath)}`,
      }
    }
    if(id === "\0solidocs:site") {
      return {
        moduleType: "js",
        code: `export default ${JSON.stringify({
          title: options.config.title,
          description: options.config.description,
          lang: options.config.lang ?? "en",
          basePath: options.config.basePath,
          themeConfig: options.config.themeConfig,
        })}`,
      }
    }
    return
  },
})
