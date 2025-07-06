import * as fs from "node:fs/promises"
import type { Plugin } from "rolldown"
import { p } from "../utils/path.ts"
import type { ParsedConfig } from "../utils/config.ts"

export type Routes = Array<[string, string]>

export const routingPlugin = (options: { config: ParsedConfig, routes: Routes }): Plugin => ({
  name: "solidocs-routing",
  resolveId(src) {
		if (src === "solidocs:routes") {
			return "\0" + src
		}
    return
	},
	load(id) {
    if (id === "\0solidocs:routes") {
      return {
        moduleType: "js",
        code: `
          import { lazy } from "solid-js"
          export default [ ${options.routes.map(route => `{
            path: ${JSON.stringify(route[0])},
            component: lazy(() => import(${JSON.stringify(p(route[1]))})),
            }`)
          } ]
        `
      }
    }
    return
  }
})

export const getRoutes = async (): Promise<Routes> => {
  const srcs = await Array.fromAsync(fs.glob("./**/*.md", { exclude: ["./node_modules"] }))
  return srcs.map(src => {
    return [
      (src.replace(/\.md$/, "").replace(/\/?index$/, "/") + "/" ).replaceAll(/\/+/g, "/"),
      src,
    ]
  })
}
