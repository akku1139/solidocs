import { renderToStringAsync } from "solid-js/web"
import { app as APP } from "../App.tsx"

export const render = (url: string) => renderToStringAsync(
  <APP url={url} />,
)

