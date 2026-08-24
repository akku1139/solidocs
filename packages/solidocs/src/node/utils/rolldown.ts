import type { ParsedConfig } from "./config.ts"
import type { PageMeta } from "../../shared/types.ts"
import type { BuildOptions as RolldownBuildOptions } from "rolldown"
import mdx from "@mdx-js/rollup"
import { default as solidPlugin, type Options as SolidOptions } from "vite-plugin-solid"
import { routingPlugin } from "../rolldown-plugins/routing.ts"
import { fixSolidImportPlugin } from "../rolldown-plugins/fix-solid-import.ts"
import { mdxDomExpressionsPlugin } from "../rolldown-plugins/mdx-dom-expressions.ts"
import { stripFrontmatterPlugin } from "../rolldown-plugins/strip-frontmatter.ts"
import { headingSlugPlugin } from "../rolldown-plugins/heading-slugs.ts"
import rehypeShiki from "@shikijs/rehype"
import remarkGfm from "remark-gfm"

/**
 * Dual-theme syntax highlighting: generated markup carries CSS
 * variables for both palettes (`--shiki-light` / `--shiki-dark`), so
 * the theme's light/dark toggle works without re-rendering.
 */
const shikiOptions = {
  themes: {
    light: "github-light",
    dark: "github-dark",
  },
  defaultColor: false,
  // Highlight language-less fences as plain text so every code block
  // gets the same themed markup instead of falling back to raw <pre>.
  defaultLanguage: "text",
} as const

// TODO: use filter https://rolldown.rs/guide/plugin-development
export const baseRolldownPlugns = (options: {
  config: ParsedConfig,
  pages: PageMeta[],
  solidOptions: SolidOptions["solid"],
  dev: boolean,
  ssr: boolean,
}): RolldownBuildOptions["plugins"] => {
  return [
    stripFrontmatterPlugin,
    routingPlugin({ config: options.config, pages: options.pages, ssr: options.ssr }),
    mdx({
      jsx: true,
      jsxImportSource: "solid-js",
      remarkPlugins: [remarkGfm],
      rehypePlugins: [[rehypeShiki, shikiOptions]],
    }),
    mdxDomExpressionsPlugin,
    solidPlugin({
      extensions: [".md", ".mdx"],
      dev: options.dev,
      solid: options.solidOptions,
      ssr: options.ssr,
    }),
    fixSolidImportPlugin,
    headingSlugPlugin,
  ]
}
