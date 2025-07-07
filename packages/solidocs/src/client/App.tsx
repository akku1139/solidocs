import { Router } from "@solidjs/router"
import { HydrationScript, NoHydration, isServer, Suspense } from "solid-js/web"
import routes from "solidocs:routes"
import type { App } from "../shared/types.ts"

export const Main: App = (props) => {
return <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Solidocs</title>
    <HydrationScript />
  </head>
  <body>
    <div id="root">
      <Suspense fallback={<div>Loading...</div>}>
        <Router base={props.base} url={isServer ? props.url : void 0} >{
          // routesSignal() // Uncaught TypeError: Comp is not a function
          routes
        }</Router>
      </Suspense>
    </div>
    <NoHydration>
      <script src={props?.entry} type="module" defer />
    </NoHydration>
  </body>
</html>
}
