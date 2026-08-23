import type { Plugin } from "rolldown"

/**
 * MDX has no built-in frontmatter support: the `---` block would end up
 * in the document as a thematic break plus a setext heading containing
 * the raw `title: ...` lines. Strip it before compilation — metadata is
 * extracted separately for the virtual routes module.
 */
export const stripFrontmatterPlugin: Plugin = {
  name: "solidocs-strip-frontmatter",
  transform: {
    filter: {
      id: /\.mdx?$/
    },
    handler(code) {
      const match = /^---\r?\n[\s\S]*?\r?\n---[ \t]*\r?\n?/.exec(code)
      if(!match) return null
      return { code: code.slice(match[0].length), map: null }
    },
  },
}
