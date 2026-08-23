import { createMemo, Show, type ParentProps } from "solid-js"
import { useLocation } from "@solidjs/router"
import type { SiteConfig } from "../../shared/types.ts"
import routes from "solidocs:routes"
import { PageMetaProvider, normalizeRoutePath } from "./PageMetaProvider.tsx"
import { Sidebar } from "./Sidebar.tsx"
import { Outline } from "./Outline.tsx"
import { Pager } from "./Pager.tsx"

/**
 * Default documentation theme: header with site title, global sidebar
 * built from all pages, content and an "on this page" outline.
 * Pages with `layout: home` frontmatter render a hero section instead
 * of the regular doc layout (no sidebar/outline).
 */
export const DefaultTheme = (props: ParentProps<{ site?: SiteConfig }>) => {
  const location = useLocation()
  const currentPath = () => normalizeRoutePath(location.pathname)

  // Metadata of the routed page, resolved from the virtual route list.
  const meta = createMemo(() =>
    routes.find(route => route.path === currentPath()),
  )
  const isHome = () => meta()?.frontmatter.layout === "home"

  return (
    <PageMetaProvider value={meta}>
      <Show
        when={!isHome()}
        fallback={
          <div class="solidocs-shell">
            <Header site={props.site} />
            <main class="solidocs-home">
              <h1 class="solidocs-home-title">{props.site?.title ?? "Solidocs"}</h1>
              <p class="solidocs-home-tagline">{props.site?.description ?? ""}</p>
              <div class="solidocs-doc">{props.children}</div>
            </main>
          </div>
        }
      >
        <div class="solidocs-shell">
          <Header site={props.site} />
          <div class="solidocs-layout">
            <Sidebar pages={routes} currentPath={currentPath} basePath={props.site?.basePath ?? "/"} />
            <main class="solidocs-content">
              <article class="solidocs-doc">
                {props.children}
                <Pager />
              </article>
            </main>
            <div class="solidocs-aside">
              <Outline />
            </div>
          </div>
        </div>
      </Show>
    </PageMetaProvider>
  )
}

const Header = (props: { site?: SiteConfig }) => (
  <header class="solidocs-header">
    <a href="/" class="solidocs-header-brand">{props.site?.title ?? "Solidocs"}</a>
  </header>
)
