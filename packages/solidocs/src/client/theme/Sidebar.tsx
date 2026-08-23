import { For, Show } from "solid-js"

interface PageLike {
  path: string
  title: string
  frontmatter: { layout?: "home" | "doc" | "page" }
}

export interface SidebarProps {
  pages: PageLike[]
  currentPath: () => string
  basePath: string
}

/**
 * Global navigation built from all collected markdown pages.
 */
export const Sidebar = (props: SidebarProps) => {
  const href = (path: string) =>
    (props.basePath + path).replaceAll(/\/+/g, "/")

  return (
    <aside class="solidocs-sidebar">
      <nav aria-label="Pages">
        <ul>
          <For each={props.pages}>
            {page => (
              <li>
                <a
                  href={href(page.path)}
                  classList={{
                    "solidocs-sidebar-link": true,
                    "is-active": normalize(props.currentPath()) === page.path,
                    "is-home": page.frontmatter.layout === "home",
                  }}
                >
                  {page.title}
                </a>
              </li>
            )}
          </For>
        </ul>
        <Show when={props.pages.length === 0}>
          <p class="solidocs-sidebar-empty">No pages yet.</p>
        </Show>
      </nav>
    </aside>
  )
}

/** Client router paths never carry a trailing slash; compare accordingly. */
const normalize = (path: string) =>
  path === "/" ? "/" : `/${path.split("/").filter(Boolean).join("/")}/`
