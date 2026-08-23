import * as v from "valibot"
import type { ParseArgsOptionsConfig } from "node:util"

export const ConfigSchema = v.object({
  title: v.string(),
  description: v.optional(v.string()),
  lang: v.optional(v.string()),
  // srcDir: v.optional(v.string(), "pages"),
  // distDir: v.optional(v.string(), "dist"),
  /// GitHub Pages Support
  // basePath: v.optional(v.union([
  //   v.pipe(v.string(), v.endsWith("/")),
  //   v.pipe(v.string(), v.url()),
  // ]))
  basePath: v.optional(v.string(), "/"), // TODO: support relative base path
  /// Header customization (VitePress style)
  themeConfig: v.optional(
    v.object({
      siteTitle: v.optional(v.string()),
      logo: v.optional(v.string()),
      link: v.optional(v.string()),
      nav: v.optional(
        v.array(
          v.object({
            text: v.string(),
            link: v.string(),
            target: v.optional(v.string()),
          }),
        ),
      ),
    }),
  ),
})

export type UserConfig = v.InferInput<typeof ConfigSchema>
export type ParsedConfig = v.InferOutput<typeof ConfigSchema>

export const defineConfig = (config: UserConfig) => config

/**
 * Command line options that override the config file.
 * Shared by every command so `solidocs build --title X` and
 * `solidocs dev --title X` behave the same.
 */
export const configOverrideArgs: ParseArgsOptionsConfig = {
  title: { type: "string" },
  description: { type: "string" },
  lang: { type: "string" },
  // `--base-path` maps to `basePath`
  "base-path": { type: "string" },
  config: { type: "string" },
}

/**
 * Merge parsed CLI overrides into a parsed config.
 * Only options actually passed on the command line are applied.
 */
export const applyConfigOverrides = (
  config: ParsedConfig,
  args: Record<string, unknown>,
): ParsedConfig => {
  const overrides: ParsedConfig = { ...config }

  if(typeof args.title === "string") overrides.title = args.title
  if(typeof args.description === "string") overrides.description = args.description
  if(typeof args.lang === "string") overrides.lang = args.lang

  if(typeof args["base-path"] === "string") {
    // Normalize: ensure leading and trailing slashes.
    let base = args["base-path"].trim()
    if(base === "" || base === "/") {
      overrides.basePath = "/"
    } else {
      if(!base.startsWith("/")) base = `/${base}`
      if(!base.endsWith("/")) base += "/"
      overrides.basePath = base.replaceAll(/\/{2,}/g, "/")
    }
  }

  return overrides
}
