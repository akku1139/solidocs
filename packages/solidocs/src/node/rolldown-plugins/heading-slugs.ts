import GithubSlugger from "github-slugger"
import type { Plugin } from "rolldown"

/**
 * Adds `id` attributes to headings (GitHub style slugs) so the outline
 * and in-page anchors can link to them — the same job rehype-slug does
 * for regular markdown pipelines.
 *
 * Solid's SSR compile stores templates as string-array pairs, so a
 * heading appears as:
 *   _tmpl$4 = ["<h2", ">Options</h2>"]
 * The id must therefore be injected into the first part (the opening
 * tag). Client DOM output uses plain JSX strings, which the second
 * pattern covers.
 */
export const headingSlugPlugin: Plugin = {
  name: "solidocs-heading-slugs",
  transform: {
    filter: {
      id: /\.mdx?$/
    },
    handler(code) {
      const slugger = new GithubSlugger()
      let changed = false

      // 1) SSR template-pair form: ["<h2", ">Options</h2>"]
      let result = code.replace(
        /\["<h([1-6])",(\s*)">([\s\S]*?)<\/h\1>"\]/g,
        (full, level: string, gap: string, inner: string) => {
          const text = decodeEntities(stripMarkup(inner)).trim()
          if(text.length === 0) return full
          const id = slugger.slug(text)
          if(id.length === 0) return full
          changed = true
          // The template part is a double-quoted JS string, so the id
          // must be single-quoted to avoid breaking out of it.
          return `["<h${level} id='${id}'",${gap}">` + `${inner}</h${level}>"]`
        },
      )

      // 2) Plain HTML/JSX form: <h2>Options</h2>
      result = result.replace(
        /(<h([1-6])((?:\s[^>]*)?)>)([\s\S]*?)(<\/h\2>)/g,
        (full, _open: string, level: string, attrs: string | undefined, inner: string) => {
          if(attrs && /\bid\s*=\s*["'{]/.test(attrs)) return full
          const text = decodeEntities(stripMarkup(inner)).trim()
          if(text.length === 0 || text.includes("_tmpl")) return full
          const id = slugger.slug(text)
          if(id.length === 0) return full
          changed = true
          return `<${level} id=${quote(id)}${attrs ?? ""}>${inner}</${level}>`
        },
      )

      if(!changed) return null
      return { code: result, map: null }
    },
  },
}

/** Remove nested tags and JSX string wrappers from heading content before slugging. */
const stripMarkup = (html: string) =>
  html
    .replace(/<[^>]*>/g, "")
    .replace(/^\{\s*"/, "")
    .replace(/"\s*\}\s*$/, "")

/** JSON-quoted attribute value — safe inside generated JS code. */
const quote = (value: string) => JSON.stringify(value)

/** Resolve the handful of entities markdown emits. */
const decodeEntities = (text: string) =>
  text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
