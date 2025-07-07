import type { Component } from "solid-js"
import type { render } from "../client/entry/ssr.tsx"

export type App = Component<Partial<{
  url: string
  base: string
  entry: string
}>>

export type AppRender = typeof render
