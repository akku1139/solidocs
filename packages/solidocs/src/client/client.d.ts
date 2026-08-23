// Type declarations for solidocs' rolldown virtual modules.

declare module "solidocs:routes" {
  interface VirtualFrontmatter {
    layout?: "home" | "doc" | "page"
    title?: string
    description?: string
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
  interface VirtualSiteConfig {
    title: string
    description?: string
    lang: string
    basePath: string
  }
  const site: VirtualSiteConfig
  export default site
}

declare module "*.css"
