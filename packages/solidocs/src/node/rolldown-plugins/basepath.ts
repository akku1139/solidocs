import type { Plugin } from "rolldown"
import type { ParsedConfig } from "../utils/config.ts"

export type Routes = Array<[string, string]>

export const basePathPlugin = (config: ParsedConfig ): Plugin => ({
  name: "solidocs-routing",
  resolveId(src) {
		if (src === "solidocs:basepath") {
			return "\0" + src
		}
    return
	},
	load(id) {
    if (id === "\0solidocs:basepath") {
      return {
        moduleType: "js",
        code: `export default ${JSON.stringify(config.basePath)}`
      }
    }
    return
  }
})
