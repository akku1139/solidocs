import type { CMD } from "../types.ts"
import type { ParseArgsOptionsConfig } from "node:util"
import { build as rolldownBuild } from "rolldown"
import { getRoutes } from "../rolldown-plugins/routing.ts"

import mdx from "@mdx-js/rollup"
import { baseRolldownPlugns } from "../utils/rolldown.ts"

export const argsSchema: ParseArgsOptionsConfig = {
}

export const cmd: CMD<typeof argsSchema> = async (config, _args) => {
  process.env.NODE_ENV = "production"

  console.log("building...")

  const routes = await getRoutes()

  await rolldownBuild([{
    plugins: baseRolldownPlugns({
      config, routes,
      solidOptions: {
        generate: "ssr",
        hydratable: true,
      },
      dev: false,
    })
  }])

  return true
}
