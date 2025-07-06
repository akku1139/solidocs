import type { Plugin } from "rolldown"

// https://github.com/solidjs/vite-plugin-solid/blob/4fd7a5dea1a49cea4426ff22d11cc74ccf6cedd9/src/index.ts#L266
// not working?
// Solve it with pnpm patch temporarily.
export const fixSolidPlugin: Plugin = {
  name: "solidocs-fixsolid",
  options(opts) {
    if(!opts.resolve) opts.resolve = {}
    if(!opts.resolve.conditionNames) opts.resolve.conditionNames = []
    opts.resolve.conditionNames = Array.from(new Set(["solid", ...opts.resolve.conditionNames]))
    return opts
  }
}
