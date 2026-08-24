import type { CMD } from "../types.ts"
import type { ParseArgsOptionsConfig } from "node:util"
import { build as rolldownBuild } from "rolldown"
import { getPages } from "../rolldown-plugins/routing.ts"
import { baseRolldownPlugns } from "../utils/rolldown.ts"
import { p, pkgPath } from "../utils/path.ts"
import * as path from "node:path"
import type { AppRender } from "../../shared/types.ts"
import * as process from "node:process"
import * as fs from "node:fs/promises"

export const argsSchema: ParseArgsOptionsConfig = {
}

export const cmd: CMD<typeof argsSchema> = async (config, _args) => {
  process.env.NODE_ENV = "production"

  const clientBaseDir = "/_assets/js/"

  const distDir = p(".solidocs/dist")
  await fs.rm(distDir, { recursive: true, force: true })
  await fs.mkdir(distDir, { recursive: true })

  console.log("building app...")

  const pages = await getPages()

  console.log("build for client")
  const skipClient = process.env.SOLIDOC_SKIP_CLIENT === "1"
  const clientBuildResult = skipClient ? { output: [{ fileName: "client.js" }] } : await rolldownBuild({
    input: pkgPath("src/client/entry/client.tsx"),
    output: {
      dir: path.resolve(distDir + clientBaseDir),
      format: "esm",
    },
    platform: "browser",
    // Keep `import "./theme.css"` (side-effect only imports) alive.
    // Keep `import "./theme.css"` (side-effect only imports) alive.
    treeshake: { moduleSideEffects: [{ test: /\.css$/, sideEffects: true }] },
    plugins: baseRolldownPlugns({
      config, pages,
      solidOptions: {
        generate: "dom",
        hydratable: true,
      },
      dev: false,
      ssr: false,
    })
  })

  console.log("build for prerendering")
  const ssrEntryFile = p("node_modules/.solidocs/ssr-build.js")
  if(process.env.SOLIDOC_SKIP_SSR !== "1") await rolldownBuild({
    input: pkgPath("src/client/entry/ssr.tsx"),
    output: {
      file: ssrEntryFile,
      format: "esm",
      inlineDynamicImports: true,
    },
    platform: "node",
    treeshake: true,
    external: id => {
      if(id.startsWith("solidocs:")) return false
      if(id === "solid-js" || id === "solid-js/web") return true
      if(id.endsWith(".jsx") || id.endsWith(".tsx")) return false
      return false
    },
    plugins: baseRolldownPlugns({
      config, pages,
      solidOptions: {
        generate: "ssr",
        hydratable: true,
      },
      dev: false,
      ssr: true,
    }),
  })

  console.log("prerendering...")

  // Rolldown >= 1.2 no longer bundles CSS, so inline the default theme
  // stylesheet directly into every page.
  const themeCss = await fs.readFile(
    pkgPath("src/client/theme/styles/theme.css"),
    "utf8",
  )
  const themeStyleTag = `<style>${themeCss}</style>`
  const themeInitScript = `<script>try{var t=localStorage.getItem("solidocs-theme");if(t)document.documentElement.dataset.theme=t}catch(e){}</script>`

  const render = (await import(ssrEntryFile)).render as AppRender

  // Router 1.x matches against the full location (including the base
  // path), so pass base + route as the prerender url.
  for (const page of pages) {
    console.log("path:", page.path)
    const routeUrl = (config.basePath + page.path).replaceAll(/\/{2,}/g, "/")
    const entryUrl = (config.basePath + clientBaseDir + clientBuildResult.output[0]?.fileName).replaceAll(/\/{2,}/g, "/")
    const site = {
      title: config.title,
      description: config.description,
      lang: config.lang ?? "en",
      basePath: config.basePath,
    }
    const html = await render(routeUrl, entryUrl, config.basePath, page, site)
    // Rolldown no longer bundles CSS: inline the theme stylesheet into <head>.
    // The init script applies the stored theme before first paint (no FOUC).
    const content = "<!DOCTYPE html>" + html.replace(
      "</head>",
      themeInitScript + themeStyleTag + "</head>",
    )
    const outFile = path.resolve(distDir, page.src.replace(/\.md$/, ".html"))
    await fs.mkdir(path.dirname(outFile), { recursive: true })
    await fs.writeFile(outFile, content)
  }

  console.log("done.")

  return true
}
