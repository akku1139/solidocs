import routes from "solidocs:routes"
import basepath from "solidocs:basepath"
import { usePageMeta } from "./PageMetaProvider.tsx"

/**
 * "Previous / Next" navigation between adjacent documentation pages,
 * ordered the same way as the sidebar. Home pages are skipped.
 */
export const Pager = () => {
  const meta = usePageMeta()
  const index = () => routes.findIndex(r => r.path === meta?.()?.path)

  // Prefix site-relative route paths with the configured base path.
  const href = (path: string) => (basepath + path).replaceAll(/\/+/g, "/")

  // Frontmatter overrides: a string replaces the label, `false` hides
  // the link entirely, anything else uses the adjacent page.
  type Override = string | false | undefined
  const overrideFor = (side: "prev" | "next"): { text?: string, hidden?: boolean } => {
    const fm = meta?.()?.frontmatter
    const raw: Override = side === "prev" ? fm?.prev : fm?.next
    if(raw === false) return { hidden: true }
    if(typeof raw === "string") return { text: raw }
    return {}
  }

  const prev = () => {
    let j = index() - 1
    while (j >= 0 && routes[j]?.frontmatter.layout === "home") j--
    return j >= 0 ? routes[j] : undefined
  }
  const next = () => {
    const i = index()
    if(i < 0) return undefined
    let j = i + 1
    while (j < routes.length && routes[j]?.frontmatter.layout === "home") j++
    return j < routes.length ? routes[j] : undefined
  }

  return (
    <nav class="solidocs-pager">
      {(() => {
        const cfg = overrideFor("prev")
        if(cfg.hidden) return <span />
        const p = prev()
        return p ? (
          <a class="solidocs-pager-prev" href={href(p.path)}>
            <span>{cfg.text ?? "Previous"}</span>
            <strong>{p.title}</strong>
          </a>
        ) : <span />
      })()}
      {(() => {
        const cfg = overrideFor("next")
        if(cfg.hidden) return <span />
        const n = next()
        return n ? (
          <a class="solidocs-pager-next" href={href(n.path)}>
            <span>{cfg.text ?? "Next"}</span>
            <strong>{n.title}</strong>
          </a>
        ) : <span />
      })()}
    </nav>
  )
}
