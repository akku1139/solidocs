import * as v from "valibot"
import { pathToFileURL } from "node:url"
import * as nodePath from "node:path"
import { ConfigSchema, configOverrideArgs, applyConfigOverrides } from "./utils/config.ts"
import { parseArgs, type ParseArgsOptionsConfig } from "node:util"
import * as process from "node:process"

import type { CMD } from "./types.ts"
import type { ParsedConfig } from "./utils/config.ts"
import * as build from "./cmd/build.ts"
import * as dev from "./cmd/dev.ts"

const loadConfig = async (file: string): Promise<unknown> => {
  // Relative paths are resolved from the user's project root (cwd).
  const absolute = nodePath.isAbsolute(file) ? file : nodePath.resolve(process.cwd(), file)
  const mod = await import(pathToFileURL(absolute).href)
  return (mod as { default: unknown }).default
}

// TODO: Support TS config
const defaultConfigFile = "solidocs.config.ts"

// Global flags that must be parsed before a command is selected.
const preArgs = parseArgs({
  args: process.argv.slice(2),
  options: {
    config: { type: "string" },
  },
  strict: false,
  allowPositionals: true,
})

const configFilePath = typeof preArgs.values.config === "string"
  ? preArgs.values.config
  : defaultConfigFile

let userConfig: unknown
try {
  userConfig = await loadConfig(configFilePath)
} catch (error) {
  console.error(`Cannot load config file "${configFilePath}"`)
  throw error
}

const commands: Record<string, { cmd: CMD<any>, argsSchema: ParseArgsOptionsConfig }> = {
  build,
  dev,
}

const commandName = process.argv[2] ?? ""
const command = commands[commandName]

/**
 * Apply CLI overrides on top of the config file values and validate.
 * Validation happens after merging so an override can satisfy the schema.
 */
const withOverrides = (args: Record<string, unknown>): ParsedConfig => {
  const merged = applyConfigOverrides(userConfig as ParsedConfig, args)
  return v.parse(ConfigSchema, merged)
}

if(command) {
  const args = parseArgs({
    args: process.argv.slice(3),
    options: { ...command.argsSchema, ...configOverrideArgs },
  })
  await command.cmd(withOverrides(args.values), args)
} else {
  // No known command: run the dev server with everything as arguments.
  const args = parseArgs({
    args: process.argv.slice(2),
    options: { ...commands.dev!.argsSchema, ...configOverrideArgs },
    allowPositionals: true,
  })
  await commands.dev!.cmd(withOverrides(args.values), args)
}
