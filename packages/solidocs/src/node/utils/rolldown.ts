import type { ParsedConfig } from "../utils/config.ts"
import type { BuildOptions as RolldownBuildOptions } from "rolldown"
import mdx from "@mdx-js/rollup"
import {default as solidPlugin, type Options as SolidOptions} from "vite-plugin-solid"
import { routingPlugin, type Routes } from "../rolldown-plugins/routing.ts"
import { fixSolidImportPlugin } from "../rolldown-plugins/fix-solid-import.ts"
import { mdxDomExpressionsPlugin } from "../rolldown-plugins/mdx-dom-expressions.ts"
import { basePathPlugin } from "../rolldown-plugins/basepath.ts"

// TODO: use filter https://rolldown.rs/guide/plugin-development
export const baseRolldownPlugns = (options: {
  config: ParsedConfig,
  routes: Routes,
  solidOptions: SolidOptions["solid"],
  dev: boolean,
  ssr: boolean,
}): RolldownBuildOptions["plugins"] => {
  return [
    routingPlugin({ config: options.config, routes: options.routes }),
    basePathPlugin(options.config),
    mdx({
      jsx: true,
      jsxImportSource: "solid-js",
    }),
    mdxDomExpressionsPlugin,
    solidPlugin({
      extensions: [".md", ".mdx"],
      dev: options.dev,
      solid: options.solidOptions,
      ssr: options.ssr,
    }),
    fixSolidImportPlugin,
  ]
}
