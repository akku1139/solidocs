import { p } from "./utils/path.ts"
import * as v from "valibot"
import { fileURLToPath } from "node:url"
import { ConfigSchema } from "./utils/config.ts"
import { parseArgs, type ParseArgsOptionsConfig } from "node:util"
import * as process from "node:process"

import type { CMD } from "./types.ts"
import * as build from "./cmd/build.ts"
import * as dev from "./cmd/dev.ts"

// TODO: Support TS config
const configFilePath = p("solidocs.config.ts")
const config = v.parse(ConfigSchema,
  (await import(fileURLToPath(new URL(configFilePath, import.meta.url)))).default as unknown
)

const commands: Record<string, { cmd: CMD<any>, argsSchema: ParseArgsOptionsConfig }> = {
  build,
  dev,
}

const command = commands[process.argv[2] ?? ""]

if(command) {
  await command.cmd(config, parseArgs({ args: process.argv.splice(3), options: command.argsSchema }))
} else {
  await commands.dev!.cmd(config, parseArgs({ args: process.argv.splice(2), options: commands.dev?.argsSchema }))
}
