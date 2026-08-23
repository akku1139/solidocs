import { createSignal, For, onCleanup, onMount, Show } from "solid-js"
import { usePageMeta } from "./PageMetaProvider.tsx"

/**
 * "On this page" table of contents for the current document.
 * The entry matching the scroll position is highlighted.
 */
export const Outline = () => {
  const meta = usePageMeta()
  const [activeId, setActiveId] = createSignal("")

  onMount(() => {
    if(!meta?.()?.outline?.length) return

    const headings = meta()!.outline
      .map(entry => document.getElementById(entry.id))
      .filter((el): el is HTMLElement => el !== null)

    if(headings.length === 0) return

    /** Pick the heading closest above the viewport's upper third. */
    const update = () => {
      const line = window.innerHeight * 0.33
      let current = ""
      for(const heading of headings) {
        if(heading.getBoundingClientRect().top <= line) current = heading.id
        else break
      }
      setActiveId(current)
    }

    update()
    window.addEventListener("resize", update, { passive: true })
    // Scroll events from the window and any scroll container.
    document.addEventListener("scroll", update, { passive: true, capture: true })

    onCleanup(() => {
      window.removeEventListener("resize", update)
      document.removeEventListener("scroll", update, { capture: true })
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
