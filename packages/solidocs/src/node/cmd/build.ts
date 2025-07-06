import type { CMD } from "../types.ts"
import type { ParseArgsOptionsConfig } from "node:util"

export const argsSchema: ParseArgsOptionsConfig = {
}

export const cmd: CMD<typeof argsSchema> = async (config, args) => {
  console.log("building...")
  return true
}
