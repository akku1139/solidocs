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

/** Action button in a home hero (`hero.actions`). */
export interface HeroAction {
  /** Button label. */
  text: string
  /** Absolute url or site-relative path (base path is prepended). */
  link: string
  /** `brand` renders the filled accent style, default is subtle. */
  theme?: "brand" | "alt"
}

/** Feature card in a home hero (`hero.features`). */
export interface HeroFeature {
  icon?: string
  title: string
  details?: string
}

/**
 * VitePress-style hero section, driven by the home page frontmatter:
 *
 *   ---
 *   layout: home
 *   hero:
 *     name: ...
 *     text: ...
 *     tagline: ...
 *     actions:
 *       - text: Get Started
 *         link: /guide/getting-started/
 *         theme: brand
 *     features:
 *       - icon: ⚡
 *         title: Instant
 *         details: ...
 *   ---
 */
export interface HeroConfig {
  /** Big gradient headline (defaults to the site title). */
  name?: string
  /** Short punchy line under the name. */
  text?: string
  /** Muted supporting line. */
  tagline?: string
  actions?: HeroAction[]
  features?: HeroFeature[]
}

export interface Frontmatter {
  layout?: "home" | "doc" | "page"
  title?: string
  description?: string
  /**
   * Position in the global navigation (sidebar, pager and home cards).
   * Lower comes first; unordered pages keep alphabetical order after
   * all ordered ones.
   */
  order?: number
  hero?: HeroConfig
}

/** One entry of the header navigation (`themeConfig.nav`). */
export interface ThemeNavLink {
  /** Label shown in the header. */
  text: string
  /** Absolute url or site-relative path (base path is prepended). */
  link: string
  /** Override the anchor target; external links default to `_blank`. */
  target?: string
}

/**
 * Header customization, mirroring VitePress' `themeConfig`.
 * Set from `solidocs.config.ts` and exposed via `solidocs:site`.
 */
export interface ThemeConfig {
  /** Brand text; `false` hides it (defaults to the site title). */
  siteTitle?: string | false
  /** Url of a logo image rendered before the brand text. */
  logo?: string
  /** Where the brand links to (defaults to the base path). */
  link?: string
  /** Links rendered on the right side of the header. */
  nav?: ThemeNavLink[]
}

/** Site level configuration exposed to the client theme. */
export interface SiteConfig {
  title: string
  description?: string
  lang: string
  basePath: string
  themeConfig?: ThemeConfig
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
