import type { CMD } from "../types.ts"
import type { ParseArgsOptionsConfig } from "node:util"
import * as process from "node:process"
import { rolldown } from "rolldown"
import * as path from "node:path"
import { getRoutes } from "../rolldown-plugins/routing.ts"
import { baseRolldownPlugns } from "../utils/rolldown.ts"
import { Hono } from "hono"
import { serve } from "@hono/node-server"
import { p } from "../utils/path.ts"
import * as fs from "node:fs/promises"
// import { showRoutes } from "hono/dev"

export const argsSchema: ParseArgsOptionsConfig = {
}

export const cmd: CMD<typeof argsSchema> = async (config, _args) => {
  process.env.NODE_ENV = "development"
  const cwd = process.cwd()

  const workDir = p("node_modules/.solidocs/dev")
  // await fs.rm(workDir, { recursive: true, force: true })
  // await fs.mkdir(workDir, { recursive: true })

  const routes = await getRoutes()

  // const bundlers = Object.create(null)

  const bundler = await rolldown({
    input: path.resolve(import.meta.dirname, "../../client/entry/dev.tsx"),
    platform: "browser",
    treeshake: false, // Required when using hmr
    // external: id => id.endsWith(".md"),
    experimental: {
      hmr: true,
    },
    plugins: baseRolldownPlugns({
      config, routes,
      solidOptions: {
        generate: "dom",
        hydratable: false,
      },
      dev: true,
      ssr: false,
    })
  })

  // let entryModule = (await bundler.generate({ format: "esm" })).output[0].code
  await bundler.generate({ format: "esm" })
  await bundler.write({ dir: workDir })

  const honoApp = new Hono()
  .get(config.basePath + "/*", async (c) => c.html((
    await fs.readFile(path.resolve(import.meta.dirname, "../../client/entry/dev.html"))
  ).toString()))
  // .get("/_dev/dev.js", async c => {
  //   return c.text(entryModule, 200, {
  //     "Content-Type": "text/javascript"
  //   })
  // })
  .get("/_dev/*", async c => {
    const targetPath = c.req.path.replace(/^\/_dev\//, "")
    // console.log(path)
    // FIXME: Parent directory leakage by ../ ?
    return c.text((await fs.readFile(path.resolve(workDir, targetPath))).toString(), 200, {
      "Content-Type": "text/javascript"
    })
  })

  serve(honoApp)
  console.log("open", "http://" + ("localhost:3000/"+config.basePath).replaceAll(/\/+/g, "/"))
  // showRoutes(honoApp)

  const watcher = await fs.watch(cwd, { recursive: true })
  for await (const event of watcher) {
    console.log(event)
    if(!event.filename) {
      console.error("watcher: filename is not set")
      continue
    }
    const output = (await bundler.generateHmrPatch([path.join(cwd, event.filename)]))
    console.log(output)
  }

  return true
}
