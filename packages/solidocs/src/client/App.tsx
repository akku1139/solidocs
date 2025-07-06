import { Router } from "@solidjs/router"
import { HydrationScript } from "solid-js/web"
import routes from "solidocs:routes"
import type { App } from "../shared/types.ts"

export const app: App = (props?: { url?: string, base?: string, entry?: string }) => {
return <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Solidocs</title>
    <HydrationScript /> {/* It won't work due to some bug. */}
    {/*
      file:///home/akku/tmp/solidocs/docs/node_modules/.solidocs/ssr-build.js:2441
      const { nonce } = sharedConfig.context;
              ^

      TypeError: Cannot destructure property 'nonce' of 'sharedConfig.context' as it is undefined.
          at HydrationScript (file:///home/akku/tmp/solidocs/docs/node_modules/.solidocs/ssr-build.js:2441:10)
          at createComponent (file:///home/akku/tmp/solidocs/docs/node_modules/.solidocs/ssr-build.js:195:9)
          at get children (file:///home/akku/tmp/solidocs/docs/node_modules/.solidocs/ssr-build.js:3530:29)
          at NoHydration (file:///home/akku/tmp/solidocs/docs/node_modules/.solidocs/ssr-build.js:2534:15)
          at createComponent (file:///home/akku/tmp/solidocs/docs/node_modules/.solidocs/ssr-build.js:195:9)
          at app (file:///home/akku/tmp/solidocs/docs/node_modules/.solidocs/ssr-build.js:3529:41)
          at createComponent (file:///home/akku/tmp/solidocs/docs/node_modules/.solidocs/ssr-build.js:195:9)
          at render (file:///home/akku/tmp/solidocs/docs/node_modules/.solidocs/ssr-build.js:3542:45)
          at file:///home/akku/tmp/solidocs/packages/solidocs/src/node/cmd/build.ts:81:11
          at Array.map (<anonymous>)
          at Module.cmd (file:///home/akku/tmp/solidocs/packages/solidocs/src/node/cmd/build.ts:79:28)
          at async file:///home/akku/tmp/solidocs/packages/solidocs/src/node/cli.ts:24:3

      Node.js v24.3.0

    */}
  </head>
  <body>
    <div id="root">
      <Router url={props?.url} >{ // base={props?.base} url={isServer ? props?.url : ""}
        // routesSignal() // Uncaught TypeError: Comp is not a function
        routes
      }</Router>
    </div>
    <script src={props?.entry} type="module" defer />
  </body>
</html>
}
