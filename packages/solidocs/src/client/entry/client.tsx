import { hydrate } from "solid-js/web"
import { Main } from "../App.tsx"
import basepath from "solidocs:basepath"
import site from "solidocs:site"

hydrate(() => <Main base={basepath} site={site} />, document)
