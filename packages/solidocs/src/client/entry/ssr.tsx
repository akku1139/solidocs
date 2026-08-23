import { renderToStringAsync } from "solid-js/web"
import { Main } from "../App.tsx"
import type { AppRender } from "../../shared/types.ts"

export const render: AppRender = (url, entry, base, page, styleTag) => renderToStringAsync(
  () => <Main url={url} entry={entry} base={base} page={page} styleTag={styleTag} />,
)
