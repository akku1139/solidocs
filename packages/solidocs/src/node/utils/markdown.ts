import GithubSlugger from "github-slugger"
import type { Frontmatter, OutlineEntry } from "../../shared/types.ts"

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
    }
  }
  return { data, body: source.slice(match[0].length) }
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
