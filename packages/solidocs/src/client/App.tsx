import { HydrationScript, NoHydration } from "solid-js/web"
import { Show } from "solid-js"
import type { App } from "../shared/types.ts"
import { Core } from "./Core.tsx"

/**
 * Document shell. Renders <head> (per-page title/description),
 * the hydration script and the module script tag for the client bundle.
 */
export const Main: App = (props) => {
  const title = () => {
    const meta = props.page
    if(!meta) return props.site?.title ?? "Solidocs"
    if(meta.frontmatter.layout === "home" && !meta.frontmatter.title) {
      return props.site?.title ?? "Solidocs"
    }
    return `${meta.title} | ${props.site?.title ?? "Solidocs"}`
  }
  const description = () =>
    props.page?.frontmatter.description ?? props.site?.description

  return <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{title()}</title>
      <Show when={description()}>
        {d => <meta name="description" content={d()} />}
      </Show>

      <NoHydration>
        {props.noHydrate ? void 0 : <HydrationScript />}
      </NoHydration>
    </head>
    <body>
      <div id="root">
        <Core {...props} />
      </div>
      <NoHydration>
        <script src={props?.entry} type="module" defer />
      </NoHydration>
    </body>
  </html>
}
