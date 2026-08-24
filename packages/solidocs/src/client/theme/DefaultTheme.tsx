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
import { LastUpdated } from "./LastUpdated.tsx"
import { MarkdownEnhancer } from "./MarkdownEnhancer.tsx"

/**
 * Default documentation theme: header with site title, global sidebar
 * built from all pages, content and an "on this page" outline.
 * Pages with `layout: home` frontmatter render a hero section instead
 * of the regular doc layout (no sidebar/outline). The hero lives
 * outside the centered column so its gradient can span the full
 * viewport width, flush against the header.
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
  const hero = () => meta()?.frontmatter.hero
  const siteTitle = () => props.site?.title ?? "Solidocs"
  // The 404 page prerenders an unknown route, so nothing matches.
  const isNotFound = () => !meta()

  return (
    <PageMetaProvider value={meta}>
      <MarkdownEnhancer />
      <div class="solidocs-shell">
        <Header site={props.site} />
        <Show
          when={!isHome()}
          fallback={
            <>
              <Show when={hero()}>
                {h => <Hero hero={h()} siteTitle={siteTitle()} />}
              </Show>
              <main
                class="solidocs-home"
                classList={{ "solidocs-home--hero": !!hero() }}
              >
                <Show
                  when={hero()}
                  fallback={
                    <>
                      <h1 class="solidocs-home-title">{siteTitle()}</h1>
                      <p class="solidocs-home-tagline">{props.site?.description ?? ""}</p>
                      <div class="solidocs-doc">
                        {props.children}
                        <HomeNav />
                      </div>
                      <p class="solidocs-home-footer-note">
                        <a href={props.site?.basePath ?? "/"}>{siteTitle()}</a>
                      </p>
                    </>
                  }
                >
                  <div class="solidocs-home-body">
                    {props.children}
                    <HomeNav />
                  </div>
                </Show>
              </main>
            </>
          }
        >
          <div class="solidocs-layout">
            <Sidebar pages={routes} currentPath={currentPath} basePath={props.site?.basePath ?? "/"} />
            <main class="solidocs-content">
              <Show
                when={!isNotFound()}
                fallback={
                  <article class="solidocs-doc solidocs-404">
                    <h1>404</h1>
                    <p>This page could not be found.</p>
                    <p><a href={props.site?.basePath ?? "/"}>← Back to the top page</a></p>
                  </article>
                }
              >
                <article class="solidocs-doc">
                  {props.children}
                  <LastUpdated site={props.site} />
                  <Pager />
                </article>
              </Show>
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
