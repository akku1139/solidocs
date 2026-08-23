import type { Component } from "solid-js"

/**
 * Per-page metadata extracted from markdown sources at build time.
 * Embedded into the `solidocs:routes` virtual module and used by
 * both the prerenderer and the default theme.
 */
export interface PageMeta {
  /** URL path relative to the site root. Always starts and ends with "/". */
  path: string
  /** Source file path relative to the project root. */
  src: string
  /** Raw YAML frontmatter parsed out of the source file. */
  frontmatter: Frontmatter
  /** Resolved page title: frontmatter > first h1 > derived from file name. */
  title: string
  /** Table of contents extracted from level 2/3 headings. */
  outline: OutlineEntry[]
}

export interface OutlineEntry {
  level: 2 | 3
  text: string
  /** Anchor id (GitHub style slug, matches rehype-slug output). */
  id: string
}

export interface Frontmatter {
  layout?: "home" | "doc" | "page"
  title?: string
  description?: string
}

/** Site level configuration exposed to the client theme. */
export interface SiteConfig {
  title: string
  description?: string
  lang: string
  basePath: string
}

/**
 * The root application component.
 *
 * - `url`: site-relative request url (server only, for SSR routing)
 * - `entry`: public url of the client bundle
 * - `base`: configured base path
 * - `noHydrate`: skip emitting the hydration script (plain client render)
 * - `page`: per-page metadata resolved at build time (head tags, theme)
 * - `site`: site configuration from the `solidocs:site` virtual module
 * - `styleTag`: raw `<style>` markup for the theme stylesheet (build only)
 */
export type App = Component<Partial<{
  url: string
  base: string
  entry: string
  noHydrate: boolean
  page: Pick<PageMeta, "path" | "title" | "frontmatter">
  site: SiteConfig
  styleTag: string
}>>

/**
 * Renders one page to a full HTML document.
 * `page` carries per-page head information resolved at build time,
 * `site` the site config (virtual `solidocs:site`) and `styleTag`
 * the inline theme stylesheet markup.
 */
export type AppRender = (
  url: string, 
  entry: string,
  base: string,
  page: Pick<PageMeta, "path" | "title" | "frontmatter">,
  site: SiteConfig,
  styleTag?: string,
) => string | Promise<string>
