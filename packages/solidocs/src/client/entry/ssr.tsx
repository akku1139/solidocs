import { renderToString } from "solid-js/web"
import { Main } from "../App.tsx"
import type { AppRender } from "../../shared/types.ts"

// Synchronous rendering: pages are fully static, so waiting on
// Suspense (renderToStringAsync) only introduces empty-page races.
export const render: AppRender = (url, entry, base, page, site, styleTag) => renderToString(
  () => <Main url={url} entry={entry} base={base} page={page} site={site} styleTag={styleTag} />,
)
