declare module "solidocs:routes" {
  import type { Component, lazy } from "solid-js"
  const routes:  Array<{
    path: string,
    component: ReturnType<typeof lazy<Component>>,
  }> = []
  export default routes
}

declare module "solidocs:basepath" {
  let basepath: string
  export default basepath
}
