import { For, Show } from "solid-js"
import type { SiteConfig } from "../../shared/types.ts"
import { ThemeToggle } from "./ThemeToggle.tsx"

interface HeaderProps {
  site?: SiteConfig
}

/** True for absolute urls, protocol-relative and hash/mail links. */
const isExternal = (link: string) =>
  /^[a-z]+:\/\//i.test(link) || link.startsWith("//") ||
  link.startsWith("#") || link.startsWith("mailto:")

/** Resolve a nav link against the configured base path. */
const hrefFor = (link: string, basePath: string) => {
  if(isExternal(link)) return link
  if(!link.startsWith("/")) return link
  return (basePath + link).replaceAll(/\/+/g, "/")
}

/**
 * Site header: brand (logo + title) on the left, optional theme
 * navigation and the dark mode toggle on the right.
 * Content comes from `themeConfig` in solidocs.config.ts:
 *
 *   themeConfig: {
 *     logo: "/img/logo.svg",
 *     siteTitle: "Docs",
 *     link: "/",
 *     nav: [{ text: "GitHub", link: "https://github.com/…" }],
 *   }
 */
export const Header = (props: HeaderProps) => {
  const basePath = () => props.site?.basePath ?? "/"
  const theme = () => props.site?.themeConfig ?? {}
  // VitePress semantic: `siteTitle: false` hides the text entirely,
  // `undefined` falls back to the site title.
  const brand = () => {
    const cfg = theme()
    if(cfg.siteTitle === false) return undefined
    return cfg.siteTitle ?? props.site?.title ?? "Solidocs"
  }
  /** Where the brand links to (`link: "/"` means the site root). */
  const brandHref = () => {
    const link = theme().link ?? "/"
    // The root already resolves to the base path — don't prepend twice.
    return link === "/" ? basePath() : hrefFor(link, basePath())
  }

  return (
    <header class="solidocs-header">
      <div class="solidocs-header-left">
        <a href={brandHref()} class="solidocs-header-brand">
          <Show when={theme().logo}>
            {logo => <img class="solidocs-header-logo" src={logo()} alt="" />}
          </Show>
          <Show when={brand()}>
            {b => <span>{b()}</span>}
          </Show>
        </a>
      </div>
      <div class="solidocs-header-right">
        <nav class="solidocs-header-nav" aria-label="Header">
          <For each={theme().nav}>
            {item => (
              <a
                class="solidocs-header-link"
                href={hrefFor(item.link, basePath())}
                target={item.target ?? (isExternal(item.link) ? "_blank" : undefined)}
                rel={isExternal(item.link) && item.target === undefined ? "noreferrer" : undefined}
              >
                {item.text}
              </a>
            )}
          </For>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  )
}
