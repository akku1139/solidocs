import type { JSX } from "solid-js"

export type App = (props?: Partial<{
  url: string
  // base: string
  entry: string
}>) => JSX.Element
