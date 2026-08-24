import * as path from "node:path"
import * as process from "node:process"
import { accessSync } from "node:fs"
import { fileURLToPath } from "node:url"

export const rootPath = process.cwd()

export const p = (target: string) => path.resolve(rootPath, target)

/**
 * Resolve a path inside the solidocs package itself.
 *
 * Works both when running from source (src/node/...) and from the
 * compiled bundle (dist/node/...): walk up until the package root
 * (marked by package.json) and join from there.
 */
export const pkgPath = (...segments: string[]) => {
  let dir = path.dirname(fileURLToPath(import.meta.url))
  for (;;) {
    try {
      accessSync(path.join(dir, "package.json"))
      return path.resolve(dir, ...segments)
    } catch {
      const parent = path.dirname(dir)
      if (parent === dir) throw new Error("solidocs package.json not found")
      dir = parent
    }
  }
}

export const cacheDir =  path.resolve(rootPath, "node_modules", ".solidocs")
