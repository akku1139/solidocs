import { render } from "solid-js/web"
import { Core } from "../Core.tsx"
import basepath from "solidocs:basepath"
import site from "solidocs:site"

render(
  () => <Core base={basepath} site={site} noHydrate={true} />,
  document.getElementById("root")!,
)
