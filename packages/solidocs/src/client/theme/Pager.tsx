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
        const p = prev()
        return p ? (
          <a class="solidocs-pager-prev" href={href(p.path)}>
            <span>Previous</span>
            <strong>{p.title}</strong>
          </a>
        ) : <span />
      })()}
      {(() => {
        const n = next()
        return n ? (
          <a class="solidocs-pager-next" href={href(n.path)}>
            <span>Next</span>
            <strong>{n.title}</strong>
          </a>
        ) : <span />
      })()}
    </nav>
  )
}
