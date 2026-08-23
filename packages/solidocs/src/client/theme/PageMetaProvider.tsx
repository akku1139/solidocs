import { createContext, useContext, type Accessor, type ParentProps } from "solid-js"
import type { PageMeta } from "../../shared/types.ts"

const PageMetaContext = createContext<Accessor<PageMeta | undefined>>()

/**
 * Provides the metadata of the page currently being rendered to the
 * whole layout (sidebar, outline and content).
 */
export const PageMetaProvider = (props: ParentProps<{ value: Accessor<PageMeta | undefined> }>) => {
  const meta = () => props.value()
  return (
    <PageMetaContext.Provider value={meta}>
      {props.children}
    </PageMetaContext.Provider>
  )
}

/** Metadata of the page currently being rendered. */
export const usePageMeta = () => useContext(PageMetaContext)

/** Normalize a router pathname to a route path ("/foo/bar" -> "/foo/bar/"). */
export const normalizeRoutePath = (pathname: string) =>
  pathname === "" || pathname === "/"
    ? "/"
    : `/${pathname.split("/").filter(Boolean).join("/")}/`
