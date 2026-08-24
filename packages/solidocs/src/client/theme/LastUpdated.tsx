import { Show } from "solid-js"
import { usePageMeta } from "./PageMetaProvider.tsx"
import type { SiteConfig } from "../../shared/types.ts"

/**
 * Footer line under the article: "Last updated" (git timestamp) and
 * an "edit this page" link, both configured via themeConfig:
 *
 *   themeConfig: {
 *     lastUpdated: true,
 *     editLink: {
 *       repo: "akku1139/solidocs",
 *       dir: "docs",          // where the markdown lives in the repo
 *       text: "Edit this page",
 *     },
 *   }
 */
export const LastUpdated = (props: { site?: SiteConfig }) => {
  const meta = usePageMeta()
  const cfg = () => props.site?.themeConfig ?? {}
  const enabled = () =>
    cfg().lastUpdated === true || typeof cfg().lastUpdated === "string"

  const stamp = () => {
    const iso = meta?.()?.frontmatter.lastUpdated
    if(!iso) return undefined
    if(typeof cfg().lastUpdated === "string") {
      // Custom format token: replace YYYY/MM/DD occurrences.
      const d = new Date(iso)
      return (cfg().lastUpdated as string)
        .replaceAll("YYYY", String(d.getFullYear()))
        .replaceAll("MM", String(d.getMonth() + 1).padStart(2, "0"))
        .replaceAll("DD", String(d.getDate()).padStart(2, "0"))
    }
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(iso))
  }

  const editUrl = () => {
    const edit = cfg().editLink
    if(!edit?.repo) return undefined
    const src = meta?.()?.src ?? ""
    const branch = edit.branch ?? "main"
    const dir = edit.dir ? `${edit.dir}/` : ""
    return `https://github.com/${edit.repo}/blob/${branch}/${dir}${src}`
  }

  return (
    <Show when={enabled() || editUrl()}>
      <div class="solidocs-meta-row">
        <Show when={enabled() && stamp()}>
          {time => <span class="solidocs-last-updated">Last updated: {time()}</span>}
        </Show>
        <Show when={editUrl()}>
          {url => (
            <a class="solidocs-edit-link" href={url()} target="_blank" rel="noreferrer">
              {cfg().editLink?.text ?? "Edit this page"} ↗
            </a>
          )}
        </Show>
      </div>
    </Show>
  )
}
