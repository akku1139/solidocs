import { Router } from "@solidjs/router"
import { isServer, Suspense } from "solid-js/web"
import routes from "solidocs:routes"
import type { App } from "../shared/types.ts"

export const Core: App = (props) => <Suspense fallback={<div>Loading...</div>}>
  <Router base={props.base} url={isServer ? props.url : void 0} >{
    // routesSignal() // Uncaught TypeError: Comp is not a function
      routes
      }</Router>
  </Suspense>
