import { Core } from "../App.tsx"
import { render } from "solid-js/web"
import basepath from "solidocs:basepath"

render(() => <Core base={basepath} noHydrarte={true} />, document.getElementById("root")!)
