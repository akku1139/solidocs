import type { CMD } from "../types.ts"
import type { ParseArgsOptionsConfig } from "node:util"
import { watch } from "rolldown"
import * as path from "node:path"
import { getPages } from "../rolldown-plugins/routing.ts"
import { baseRolldownPlugns } from "../utils/rolldown.ts"
import { p } from "../utils/path.ts"
import { Hono } from "hono"
import { streamSSE } from "hono/streaming"
import { serve } from "@hono/node-server"
import * as fs from "node:fs/promises"

export const argsSchema: ParseArgsOptionsConfig = {
}

export const cmd: CMD<typeof argsSchema> = async (config, _args) => {
  process.env.NODE_ENV = "development"

  const workDir = p("node_modules/.solidocs/dev")

  const pages = await getPages()

  // Rebuild on change; the browser live-reloads via SSE below.
  let reloadListeners: Array<() => void> = []

  const watcher = watch({
    input: path.resolve(import.meta.dirname, "../../client/entry/dev.tsx"),
    platform: "browser",
    treeshake: false,
    plugins: baseRolldownPlugns({
      config, pages,
      solidOptions: {
        generate: "dom",
        hydratable: false,
      },
      dev: true,
      ssr: false,
    }),
    output: {
      dir: workDir,
      format: "esm",
    },
  })

  watcher.on("change", (id) => {
    console.log("rebuilt:", path.relative(process.cwd(), id))
    for(const notify of reloadListeners) notify()
  })
  watcher.on("event", (data) => {
    if(data.code === "ERROR") console.error(data.error)
  })

  // Wait for the initial build.
  await new Promise<void>(resolve => watcher.on("event", (data) => {
    if(data.code === "END") resolve()
  }))

  // Rolldown no longer emits CSS: serve the theme stylesheet and inject it.
  const themeCssPath = path.resolve(import.meta.dirname, "../../client/theme/styles/theme.css")
  const serveThemeCss = async () => fs.readFile(themeCssPath, "utf8")

  const devHtml = (
    await fs.readFile(path.resolve(import.meta.dirname, "../../client/entry/dev.html"))
  ).toString().replace(
    "</head>",
    `<script>try{var t=localStorage.getItem("solidocs-theme");if(t)document.documentElement.dataset.theme=t}catch(e){}</script>
    <link id="solidocs-dev-css" rel="stylesheet" href="/_dev/theme.css">
    <script>
      new EventSource("${config.basePath}/_dev/reload").addEventListener("reload", () => location.reload())
    </script>
    </head>`,
  )

  const honoApp = new Hono()
  .get(config.basePath + "*", async (c) => c.html(devHtml))
  .get("/_dev/reload", (c) => streamSSE(c, async (stream) => {
    let closed = false
    const notify = () => {
      void stream.writeSSE({ event: "reload", data: "1" })
    }
    reloadListeners.push(notify)
    await new Promise<void>(resolve => {
      stream.onAbort(() => {
        closed = true
        resolve()
      })
    })
    reloadListeners = reloadListeners.filter(l => l !== notify)
    if(!closed) await stream.close()
  }))
  .get("/_dev/theme.css", async (c) => {
    const css = await serveThemeCss()
    return c.body(css, 200, { "Content-Type": "text/css" })
  })
  .get("/_dev/*", async (c) => {
    const targetPath = c.req.path.replace(/^\/_dev\//, "")
    // FIXME: Parent directory leakage via ../
    return c.body(await fs.readFile(path.resolve(workDir, targetPath)), 200, {
      "Content-Type": "text/javascript"
    })
  })

  const server = serve(honoApp, (info) => {
    console.log("open", `http://localhost:${info.port}${config.basePath}`.replaceAll(/\/{2,}/g, "/"))
  })

  const shutdown = async () => {
    await watcher.close()
    server.close()
  }
  // The `node:process` ESM namespace does not expose `on`,
  // so go through the global process object.
  const proc = globalThis.process
  proc.on("SIGINT", () => void shutdown().then(() => proc.exit(0)))

  return true
}
