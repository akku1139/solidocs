import { createMemo, Show, type ParentProps } from "solid-js"
import { useLocation } from "@solidjs/router"
import type { SiteConfig } from "../../shared/types.ts"
import routes from "solidocs:routes"
import { PageMetaProvider, normalizeRoutePath } from "./PageMetaProvider.tsx"
import { Sidebar } from "./Sidebar.tsx"
import { Outline } from "./Outline.tsx"
import { Pager } from "./Pager.tsx"
import { Header } from "./Header.tsx"
import { Hero } from "./Hero.tsx"
import { HomeNav } from "./HomeNav.tsx"

/**
 * Default documentation theme: header with site title, global sidebar
 * built from all pages, content and an "on this page" outline.
 * Pages with `layout: home` frontmatter render a hero section instead
 * of the regular doc layout (no sidebar/outline).
 */
export const DefaultTheme = (props: ParentProps<{ site?: SiteConfig }>) => {
  const location = useLocation()
  // Route paths in `solidocs:routes` are site-relative, while the
  // router location includes the configured base path — strip it.
  const basePrefix = () => {
    const base = props.site?.basePath ?? "/"
    return base.endsWith("/") ? base : `${base}/`
  }
  const currentPath = () => {
    const pathname = location.pathname
    const base = basePrefix()
    if(base !== "/" && pathname.startsWith(base)) {
      return normalizeRoutePath(pathname.slice(base.length - 1))
    }
    return normalizeRoutePath(pathname)
  }

  // Metadata of the routed page, resolved from the virtual route list.
  const meta = createMemo(() =>
    routes.find(route => route.path === currentPath()),
  )
  const isHome = () => meta()?.frontmatter.layout === "home"

  return (
    <PageMetaProvider value={meta}>
      <div class="solidocs-shell">
        <Header site={props.site} />
        <Show
          when={!isHome()}
          fallback={
            <main class="solidocs-home">
              <Show
                when={meta()?.frontmatter.hero}
                fallback={
                  <>
                    <h1 class="solidocs-home-title">{props.site?.title ?? "Solidocs"}</h1>
                    <p class="solidocs-home-tagline">{props.site?.description ?? ""}</p>
                  </>
                }
              >
                {hero => (
                  <>
                    <Hero hero={hero()} siteTitle={props.site?.title ?? "Solidocs"} />
                    <div class="solidocs-home-body">
                      {props.children}
                      <HomeNav />
                    </div>
                  </>
                )}
              </Show>
              <Show when={!meta()?.frontmatter.hero}>
                <div class="solidocs-doc">
                  {props.children}
                  <HomeNav />
                </div>
                <p class="solidocs-home-footer-note">
                  <a href={props.site?.basePath ?? "/"}>{props.site?.title ?? "Solidocs"}</a>
                </p>
              </Show>
            </main>
          }
        >
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
        </Show>
      </div>
    </PageMetaProvider>
  )
}

