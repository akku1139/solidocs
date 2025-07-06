import type { Plugin } from "rolldown"

// hack.
// MDX outputs JSX like <_components.h1>, but dom-expressions cannot interpret them.
// So this plugin transforms it into <h1>.
export const mdxDomExpressionsPlugin: Plugin = {
  name: "solidocs-mdx-dom-expressions",
  transform: {
    filter: {
      id: /\.mdx?$/
    },
    handler(code) {
      return code.replaceAll("<_components.", "<").replaceAll("</_components.", "</")
    },
  }
}
