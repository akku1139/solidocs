import { Main } from "../App.tsx"
import { hydrate } from "solid-js/web"
import basepath from "solidocs:basepath"

hydrate(() => <Main base={basepath} />, document)
