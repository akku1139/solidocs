import { For, Show } from "solid-js"
import type { HeroAction } from "../../shared/types.ts"
import basepath from "solidocs:basepath"

import type { HeroConfig } from "../../shared/types.ts"

/** True for absolute urls, protocol-relative and hash/mail links. */
const isExternal = (link: string) =>
  /^[a-z]+:\/\//i.test(link) || link.startsWith("//") ||
  link.startsWith("#") || link.startsWith("mailto:")

/** Resolve a link against the configured base path. */
const hrefFor = (link: string) => {
  if(isExternal(link)) return link
  if(!link.startsWith("/")) return link
  // The bare root resolves to the base path itself.
  const base = basepath.endsWith("/") ? basepath : `${basepath}/`
  return link === "/" ? base : (base + link).replaceAll(/\/+/g, "/")
}

/**
 * VitePress-style landing hero driven by the home page frontmatter:
 * big gradient headline, tagline, call-to-action buttons and a
 * feature card grid.
 */
export const Hero = (props: { hero: HeroConfig, siteTitle: string }) => {
  const name = () => props.hero.name ?? props.siteTitle
  return (
    <section class="solidocs-hero">
      <h1 class="solidocs-hero-name">{name()}</h1>
      <Show when={props.hero.text}>
        {text => <p class="solidocs-hero-text">{text()}</p>}
      </Show>
      <Show when={props.hero.tagline}>
        {tagline => <p class="solidocs-hero-tagline">{tagline()}</p>}
      </Show>
      <Show when={props.hero.actions?.length}>
        <div class="solidocs-hero-actions">
          <For each={props.hero.actions}>
            {(action: HeroAction) => (
              <a
                class="solidocs-hero-action"
                classList={{ "is-brand": action.theme === "brand" }}
                href={hrefFor(action.link)}
                target={isExternal(action.link) ? "_blank" : undefined}
                rel={isExternal(action.link) ? "noreferrer" : undefined}
              >
                {action.text}
              </a>
            )}
          </For>
        </div>
      </Show>
      <Show when={props.hero.features?.length}>
        <div class="solidocs-hero-features">
          <For each={props.hero.features}>
            {feature => (
              <div class="solidocs-hero-feature">
                <Show when={feature.icon}>
                  {icon => <div class="solidocs-hero-feature-icon">{icon()}</div>}
                </Show>
                <h2>{feature.title}</h2>
                <p>{feature.details}</p>
              </div>
            )}
          </For>
        </div>
      </Show>
    </section>
  )
}
