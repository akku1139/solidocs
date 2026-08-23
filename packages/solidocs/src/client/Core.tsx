import { Router, type RouteSectionProps } from "@solidjs/router"
import { isServer, Suspense } from "solid-js/web"
import routes from "solidocs:routes"
import type { App } from "../shared/types.ts"
import { DefaultTheme } from "./theme/DefaultTheme.tsx"

/**
 * Application core: mounts the router with all collected pages and
 * wraps routed content in the default theme.
 */
export const Core: App = (props) => {
  return <Suspense fallback={<div class="solidocs-loading">Loading...</div>}>
    <Router base={props.base} url={isServer ? props.url : void 0} root={(routeProps: RouteSectionProps) => (
      <DefaultTheme site={props.site}>
        {routeProps.children}
      </DefaultTheme>
    )}>
      {routes.map(route => ({
        path: route.path,
        component: route.component,
      }))}
    </Router>
  </Suspense>
}
