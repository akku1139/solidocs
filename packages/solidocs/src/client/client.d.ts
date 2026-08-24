// Type declarations for solidocs' rolldown virtual modules.

declare module "solidocs:routes" {
  interface VirtualHeroAction {
    text: string
    link: string
    theme?: "brand" | "alt"
  }
  interface VirtualHeroFeature {
    icon?: string
    title: string
    details?: string
  }
  interface VirtualHeroConfig {
    name?: string
    text?: string
    tagline?: string
    actions?: VirtualHeroAction[]
    features?: VirtualHeroFeature[]
  }
  interface VirtualFrontmatter {
    layout?: "home" | "doc" | "page"
    title?: string
    description?: string
    /** Global nav position (sidebar/pager/home cards); lower first. */
    order?: number
    /** Overrides the "Previous page" pager entry (false hides it). */
    prev?: string | false
    /** Overrides the "Next page" pager entry (false hides it). */
    next?: string | false
    /** ISO timestamp of the last meaningful change (filled at build). */
    lastUpdated?: string
    hero?: VirtualHeroConfig
  }

  interface VirtualOutlineEntry {
    level: 2 | 3
    text: string
    /** Anchor id (GitHub style slug). */
    id: string
  }

  interface RouteMeta {
    /** URL path relative to the site root. Starts and ends with "/". */
    path: string
    /** Source markdown path relative to the project root. */
    src: string
    frontmatter: VirtualFrontmatter
    title: string
    outline: VirtualOutlineEntry[]
    /** Lazily loaded page component. */
    component: import("solid-js").Component
  }

  const routes: RouteMeta[]
  export default routes
}

declare module "solidocs:basepath" {
  let basepath: string
  export default basepath
}

declare module "solidocs:site" {
  interface VirtualThemeNavLink {
    text: string
    link: string
    target?: string
  }
  interface VirtualThemeEditLink {
    repo: string
    dir?: string
    branch?: string
    text?: string
  }
  interface VirtualThemeConfig {
    /** Brand text; `false` hides it (defaults to the site title). */
    siteTitle?: string | boolean
    logo?: string
    link?: string
    nav?: VirtualThemeNavLink[]
    lastUpdated?: boolean | string
    editLink?: VirtualThemeEditLink
  }
  interface VirtualSiteConfig {
    title: string
    description?: string
    lang: string
    basePath: string
    themeConfig?: VirtualThemeConfig
  }
  const site: VirtualSiteConfig
  export default site
}

declare module "*.css"
