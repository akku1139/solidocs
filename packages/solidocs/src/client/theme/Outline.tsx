import { createSignal, For, onCleanup, onMount, Show } from "solid-js"
import { usePageMeta } from "./PageMetaProvider.tsx"

/**
 * "On this page" table of contents for the current document.
 * The entry matching the scroll position is highlighted. Clicking a
 * link locks the highlight to that entry until the smooth scroll
 * settles, so intermediate headings don't flash by.
 */
export const Outline = () => {
  const meta = usePageMeta()
  const [activeId, setActiveId] = createSignal("")
  let lockUntil = 0 // timestamp until which scroll updates are ignored

  onMount(() => {
    if(!meta?.()?.outline?.length) return

    const resolveHeadings = () =>
      meta()!.outline
        .map(entry => document.getElementById(entry.id))
        .filter((el): el is HTMLElement => el !== null)

    let headings = resolveHeadings()

    /** Pick the heading closest above the viewport's upper third. */
    const update = () => {
      if(Date.now() < lockUntil) return
      const line = window.innerHeight * 0.33
      let current = ""
      for(const heading of headings) {
        if(heading.getBoundingClientRect().top <= line) current = heading.id
        else break
      }
      setActiveId(current)
    }

    /**
     * Smooth scrolling fires many scroll events while passing through
     * intermediate headings; suppress updates briefly and keep the
     * clicked entry highlighted.
     */
    const onClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement).closest("a[href^='#']")
      if(!link) return
      const id = decodeURIComponent(link.getAttribute("href")!.slice(1))
      if(!headings.some(h => h.id === id)) return
      lockUntil = Date.now() + 1200
      setActiveId(id)
    }
    document.addEventListener("click", onClick, true)
    window.addEventListener("hashchange", update)

    update()

    // Headings may mount after hydration on lazily loaded pages.
    const retry = setInterval(() => {
      headings = resolveHeadings()
      if(headings.length > 0) {
        clearInterval(retry)
        update()
      }
    }, 300)

    window.addEventListener("resize", update, { passive: true })
    document.addEventListener("scroll", update, { passive: true, capture: true })

    onCleanup(() => {
      clearInterval(retry)
      window.removeEventListener("resize", update)
      window.removeEventListener("hashchange", update)
      document.removeEventListener("scroll", update, { capture: true })
      document.removeEventListener("click", onClick, true)
    })
  })

  return (
    <Show when={meta?.()?.outline?.length}>
      <nav class="solidocs-outline" aria-label="On this page">
        <p class="solidocs-outline-title">On this page</p>
        <ul>
          <For each={meta?.()?.outline ?? []}>
            {entry => (
              <li class={`solidocs-outline-level-${entry.level}`}>
                <a href={`#${entry.id}`} classList={{ "is-active": activeId() === entry.id }}>
                  {entry.text}
                </a>
              </li>
            )}
          </For>
        </ul>
      </nav>
    </Show>
  )
}
