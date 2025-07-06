import type { CMD } from "../types.ts"
import type { ParseArgsOptionsConfig } from "node:util"
import { build as rolldownBuild } from "rolldown"
import { getRoutes } from "../rolldown-plugins/routing.ts"
import { baseRolldownPlugns } from "../utils/rolldown.ts"
import { p } from "../utils/path.ts"
import * as path from "node:path"
import { renderToStringAsync } from "solid-js/web"
import type { App } from "../../shared/types.ts"
import * as process from "node:process"

export const argsSchema: ParseArgsOptionsConfig = {
}

export const cmd: CMD<typeof argsSchema> = async (config, _args) => {
  process.env.NODE_ENV = "production"
  const cwd = process.cwd()

  console.log("building app...")

  const routes = await getRoutes()
  // console.log("routes", routes)

  console.log("build for client")
  await rolldownBuild({
    input: path.resolve(import.meta.dirname, "../../client/App.tsx"),
    output: {
      dir: p("node_modules/.solidocs/client/"), // TODO: fix
      format: "esm",
    },
    platform: "browser",
    plugins: baseRolldownPlugns({
      config, routes,
      solidOptions: {
        generate: "dom",
        hydratable: true,
      },
      dev: false,
      ssr: false,
    })
  })

  console.log("buid for prerendering")
  const appFile = p("node_modules/.solidocs/ssr-build.js")
  await rolldownBuild({
    input: path.resolve(import.meta.dirname, "../../client/App.tsx"),
    output: {
      file: appFile,
      format: "esm",
      inlineDynamicImports: true,
    },
    platform: "node",
    // external: id => {
    //   if(id.startsWith("solidocs:")) return false
    //   if(id === "solid-js" || id === "@solidjs/router") return false
    //   if(id.endsWith(".jsx") || id.endsWith(".tsx")) return false
    //   if(id.startsWith(cwd+"/node_modules/") || !id.startsWith("/")) return true
    //   return false
    // },
    plugins: baseRolldownPlugns({
      config, routes,
      solidOptions: {
        generate: "ssr",
        hydratable: true,
      },
      dev: false,
      ssr: true,
    }),
  })

  console.log("prerendering...")

  const app = (await import(appFile)).app as App

  await Promise.all(routes.map(async route => {
    console.log("path:", route[0])
    await renderToStringAsync(app({
      url: route[0],
    }))
  }))

  console.log("done.")

  return true
}
