import { HydrationScript, NoHydration } from "solid-js/web"
import type { App } from "../shared/types.ts"
import { Core } from "./Core.tsx"

export const Main: App = (props) => {
return <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Solidocs</title>
    <NoHydration>
      { props.noHydrarte ? void 0 : <HydrationScript /> }
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
