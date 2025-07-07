import type { CMD } from "../types.ts"
import type { ParseArgsOptionsConfig } from "node:util"
import { build as rolldownBuild } from "rolldown"
import { getRoutes } from "../rolldown-plugins/routing.ts"
import { baseRolldownPlugns } from "../utils/rolldown.ts"
import { p } from "../utils/path.ts"
import * as path from "node:path"
import type { AppRender } from "../../shared/types.ts"
import * as process from "node:process"
import * as fs from "node:fs/promises"

export const argsSchema: ParseArgsOptionsConfig = {
}

export const cmd: CMD<typeof argsSchema> = async (config, _args) => {
  process.env.NODE_ENV = "production"
  // const cwd = process.cwd()

  const clientBaseDir = "/_assets/js/"

  const distDir = p(".solidocs/dist")
  await fs.rm(distDir, { recursive: true, force: true })
  await fs.mkdir(distDir, { recursive: true })

  console.log("building app...")

  const routes = await getRoutes()
  // console.log("routes", routes)

  console.log("build for client")
  const clientBuildResult = await rolldownBuild({
    input: path.resolve(import.meta.dirname, "../../client/entry/client.tsx"),
    output: {
      dir: p(distDir + clientBaseDir),
      format: "esm",
    },
    platform: "browser",
    treeshake: true,
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
  const ssrEntryFile = p("node_modules/.solidocs/ssr-build.js")
  await rolldownBuild({
    input: path.resolve(import.meta.dirname, "../../client/entry/ssr.tsx"),
    output: {
      file: ssrEntryFile,
      format: "esm",
      inlineDynamicImports: true,
    },
    platform: "node",
    treeshake: true,
    /// FIXME: bug.
    external: id => {
      if(id.startsWith("solidocs:")) return false
      if(id === "solid-js" || id === "solid-js/web") return true
      // if(id === "@solidjs/router") return false
      if(id.endsWith(".jsx") || id.endsWith(".tsx")) return false
      // if(id.startsWith(cwd+"/node_modules/") || !id.startsWith("/")) return true
      return false
    },
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

  //const render = (await import(ssrEntryFile)).render as typeof render
  const render = (await import(ssrEntryFile)).render as AppRender

  await Promise.all(routes.map(async route => {
    console.log("path:", route[0])
    const content = "<!DOCTYPE html>"+await render(route[0], (config.basePath + clientBaseDir + clientBuildResult.output[0].fileName).replaceAll(/\/+/g, "/"), config.basePath)
    await fs.writeFile(path.resolve(distDir, route[1].replace(/.md$/, ".html")), content)
  }))

  console.log("done.")

  return true
}
