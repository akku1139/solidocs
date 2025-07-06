import * as v from "valibot"

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
  // basePath: v.optional(v.string(), "/"),
})

export type UserConfig = v.InferInput<typeof ConfigSchema>
export type ParsedConfig = v.InferOutput<typeof ConfigSchema>

export const defineConfig = (config: UserConfig) => config
