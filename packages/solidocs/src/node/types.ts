import type { ParsedConfig } from "./utils/config.ts"
import type { ParseArgsOptionsConfig, parseArgs } from "node:util"

/**
 * return: Is the command successful?
 */
export type CMD<A extends ParseArgsOptionsConfig> = (
  config: ParsedConfig,
  args: ReturnType<typeof parseArgs<A>>
) => Promise<boolean>
