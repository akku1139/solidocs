import { renderToStringAsync } from "solid-js/web"
import { Main } from "../App.tsx"

export const render = (url: string, clientEntryPath: string, base: string) => renderToStringAsync(
  () => <Main url={url} entry={clientEntryPath} base={base} />,
)
