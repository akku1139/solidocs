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
 * Pages are grouped by their first path segment (a "guide/foo" page is
 * nested under a "Guide" section); top-level pages render flat.
 * Home pages are hidden — the brand link already points there.
 */
export const Sidebar = (props: SidebarProps) => {
  const href = (path: string) =>
    (props.basePath + path).replaceAll(/\/+/g, "/")

  /** Group pages by first URL segment, preserving sort order. */
  const sections = () => {
    const map = new Map<string, PageLike[]>()
    for(const page of props.pages) {
      if(page.frontmatter.layout === "home") continue
      const parts = page.path.split("/").filter(Boolean)
      const key = parts.length > 1 ? parts[0]! : ""
      const list = map.get(key) ?? []
      list.push(page)
      map.set(key, list)
    }
    return [...map.entries()].map(([key, pages]) => ({
      key,
      title: key === "" ? "" : key.charAt(0).toUpperCase() + key.slice(1),
      pages,
    }))
  }

  return (
    <aside class="solidocs-sidebar">
      <nav aria-label="Pages">
        <For each={sections()}>
          {section => (
            <Show
              when={section.key !== ""}
              fallback={
                <ul>
                  <For each={section.pages}>
                    {page => <SidebarLink page={page} href={href} currentPath={props.currentPath} />}
                  </For>
                </ul>
              }
            >
              <div class="solidocs-sidebar-section">
                <p class="solidocs-sidebar-heading">{section.title}</p>
                <ul>
                  <For each={section.pages}>
                    {page => <SidebarLink page={page} href={href} currentPath={props.currentPath} />}
                  </For>
                </ul>
              </div>
            </Show>
          )}
        </For>
        <Show when={props.pages.filter(p => p.frontmatter.layout !== "home").length === 0}>
          <p class="solidocs-sidebar-empty">No pages yet.</p>
        </Show>
      </nav>
    </aside>
  )
}

const SidebarLink = (props: {
  page: PageLike
  href: (path: string) => string
  currentPath: () => string
}) => (
  <li>
    <a
      href={props.href(props.page.path)}
      classList={{
        "solidocs-sidebar-link": true,
        "is-active": normalize(props.currentPath()) === props.page.path,
      }}
    >
      {props.page.title}
    </a>
  </li>
)

/** Client router paths never carry a trailing slash; compare accordingly. */
const normalize = (path: string) =>
  path === "/" ? "/" : `/${path.split("/").filter(Boolean).join("/")}/`
