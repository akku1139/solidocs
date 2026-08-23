import GithubSlugger from "github-slugger"
import type { Frontmatter, HeroAction, HeroConfig, HeroFeature, OutlineEntry } from "../../shared/types.ts"

/**
 * Minimal YAML frontmatter support (scalars + flat string lists).
 * Avoids pulling a full YAML parser into the toolchain.
 */
export const extractFrontmatter = (source: string): {
  data: Partial<Frontmatter>
  body: string
} => {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source)
  if(!match?.[1]) return { data: {}, body: source }

  const data: Partial<Frontmatter> = {}
  for(const rawLine of match[1].split(/\r?\n/)) {
    const pair = /^([A-Za-z_][\w-]*)\s*:\s*(.*?)\s*$/.exec(rawLine)
    if(!pair || !pair[1] || pair[2] === undefined) continue
    const key = pair[1]
    const value = pair[2].replace(/^["']|["']$/g, "")
    if(key === "layout") {
      if(value === "home" || value === "doc" || value === "page") data.layout = value
    } else if(key === "title") {
      data.title = value
    } else if(key === "description") {
      data.description = value
    } else if(key === "order") {
      const n = Number(value)
      if(Number.isFinite(n)) data.order = n
    }
  }

  // VitePress-style hero block: `hero:` followed by indented keys
  // and `- ` list items. Collect every following line that is blank
  // or indented; the first non-indented line ends the block.
  const lines = match[1].split(/\r?\n/)
  // `hero:` may carry an inline value (ignored) or none at all.
  const start = lines.findIndex(line => line.trim() === "hero" || line.trim().startsWith("hero:"))
  if(start >= 0) {
    const block: string[] = []
    for(const line of lines.slice(start + 1)) {
      if(line.trim() === "" || /^\s/.test(line)) block.push(line)
      else break
    }
    data.hero = parseHeroBlock(block.join("\n"))
  }
  return { data, body: source.slice(match[0].length) }
}

const unquote = (value: string) => value.replace(/^["']|["']$/g, "")

/**
 * Parse the indented `hero:` frontmatter block into HeroConfig.
 * Supports scalar keys plus `actions:` / `features:` lists with
 * inline `- text: …` entries.
 */
export const parseHeroBlock = (block: string): HeroConfig | undefined => {
  const scalars: Record<string, string> = {}
  let actions: HeroAction[] | undefined
  let features: HeroFeature[] | undefined

  // Top-level keys sit at the block's base indentation (the indent of
  // its first non-blank line); anything deeper belongs to that key.
  const allLines = block.split(/\r?\n/)
  const baseIndent = (() => {
    for(const line of allLines) {
      if(line.trim() === "") continue
      return /^ */.exec(line)?.[0].length ?? 0
    }
    return 0
  })()
  const sections = new Map<string, string[]>()
  let current: { key: string, lines: string[] } | undefined
  for(const rawLine of allLines) {
    if(rawLine.trim() === "") continue
    const indent = /^ */.exec(rawLine)?.[0].length ?? 0
    if(indent <= baseIndent) {
      const section = /^([A-Za-z_][\w-]*)\s*:\s*(.*)$/.exec(rawLine.trim())
      if(section?.[1]) {
        current = { key: section[1], lines: section[2] ? [rawLine] : [] }
        sections.set(current.key, current.lines)
        continue
      }
    }
    if(current) current.lines.push(rawLine)
  }

  for(const [key, lines] of sections) {
    if(key === "actions" || key === "features") {
      // List section: each `- ` line starts an entry.
      const entries: Array<Record<string, string>> = []
      let entry: Record<string, string> | undefined
      for(const rawLine of lines) {
        const listItem = /^\s*-\s+(.*)$/.exec(rawLine)
        if(listItem) {
          entry = {}
          entries.push(entry)
          const inline = /^([A-Za-z_][\w-]*)\s*:\s*(.*?)\s*$/.exec(listItem[1] ?? "")
          if(inline?.[1]) entry[inline[1]] = unquote(inline[2] ?? "")
          continue
        }
        const kv = /^\s*([A-Za-z_][\w-]*)\s*:\s*(.*?)\s*$/.exec(rawLine)
        if(kv?.[1] && entry) entry[kv[1]] = unquote(kv[2] ?? "")
      }
      if(entries.length > 0) {
        if(key === "actions") {
          actions = entries.map(e => ({
            text: e.text ?? "",
            link: e.link ?? "",
            ...(e.theme ? { theme: e.theme as HeroAction["theme"] } : {}),
          })).filter(a => a.text && a.link)
        } else {
          features = entries.map(e => ({
            ...(e.icon ? { icon: e.icon } : {}),
            title: e.title ?? "",
            ...(e.details ? { details: e.details } : {}),
          })).filter(f => f.title)
        }
      }
    } else {
      // `key: value` on the section's own line.
      const value = /^[A-Za-z_][\w-]*\s*:\s*(.*)$/.exec(lines[0]?.trim() ?? "")?.[1] ?? ""
      if(value.trim()) scalars[key] = unquote(value.trim())
    }
  }

  const config: HeroConfig = {}
  if(scalars.name) config.name = scalars.name
  if(scalars.text) config.text = scalars.text
  if(scalars.tagline) config.tagline = scalars.tagline
  if(actions) config.actions = actions
  if(features) config.features = features
  return Object.keys(config).length > 0 || actions || features ? config : undefined
}

/** Strip inline code / emphasis markup from a heading before display. */
const cleanHeadingText = (text: string) =>
  text.replace(/`([^`]*)`/g, "$1").replace(/[*_~]/g, "").trim()

/**
 * GitHub style anchor id, matching what `rehype-slug` generates,
 * so outline links point at real heading elements.
 */
export const newHeadingSlugger = () => new GithubSlugger()

/**
 * Extract level 2/3 headings for the "On this page" outline.
 */
export const extractOutline = (body: string): OutlineEntry[] => {
  const slugger = new GithubSlugger()
  const entries: OutlineEntry[] = []
  let inFence = false
  for(const rawLine of body.split(/\r?\n/)) {
    const fence = /^\s*(```|~~~)/.exec(rawLine)
    if(fence) {
      inFence = !inFence
      continue
    }
    if(inFence) continue
    const heading = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(rawLine)
    if(!heading || !heading[1] || !heading[2]) continue
    const text = cleanHeadingText(heading[2])
    if(text.length === 0) continue
    entries.push({
      level: heading[1].length === 2 ? 2 : 3,
      text,
      id: slugger.slug(text),
    })
  }
  return entries
}

/**
 * Resolve the display title of a page:
 * frontmatter > first h1 > prettified file name.
 */
export const deriveTitle = (body: string, src: string, frontmatter: Frontmatter): string => {
  if(frontmatter.title) return frontmatter.title

  let inFence = false
  for(const rawLine of body.split(/\r?\n/)) {
    const fence = /^\s*(```|~~~)/.exec(rawLine)
    if(fence) {
      inFence = !inFence
      continue
    }
    if(inFence) continue
    const h1 = /^#\s+(.+?)\s*#*\s*$/.exec(rawLine)
    if(h1?.[1]) return cleanHeadingText(h1[1])
  }

  const base = src.split("/").toReversed()[0] ?? src
  return (base.replace(/\.md$/, "") || "index")
    .replace(/[-_]+/g, " ")
    .replace(/^\w/, c => c.toUpperCase())
}

/** Plain text preview of a markdown document (used later for search). */
export const extractPlainText = (body: string): string =>
  body
    // drop fences and html comments
    .replace(/```[\s\S]*?```/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/^\s*(#{1,6})\s+(.+?)\s*#*\s*$/gm, "$2")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_~`>]+/g, "")
    .replace(/^\s*[-+]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim()
