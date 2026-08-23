import { For, Show } from "solid-js"
import routes from "solidocs:routes"
import basepath from "solidocs:basepath"

/**
 * Navigation cards on the home layout, linking to the documentation
 * pages so the top page is never a dead end.
 */
export const HomeNav = () => {
  // Home pages themselves are not useful as navigation targets.
  const pages = () => routes.filter(route => route.frontmatter.layout !== "home")

  // Prefix site-relative route paths with the configured base path.
  const href = (path: string) => (basepath + path).replaceAll(/\/+/g, "/")

  return (
    <Show when={pages().length > 0}>
      <nav class="solidocs-home-nav" aria-label="Pages">
        <For each={pages()}>
          {page => (
            <a class="solidocs-home-card" href={href(page.path)}>
              <strong>{page.title}</strong>
              <span>{page.frontmatter.description ?? ""}</span>
            </a>
          )}
        </For>
      </nav>
    </Show>
  )
}
