import { For, Show } from "solid-js"
import { usePageMeta } from "./PageMetaProvider.tsx"

/**
 * "On this page" table of contents for the current document.
 */
export const Outline = () => {
  const meta = usePageMeta()
  return (
    <Show when={meta?.()?.outline?.length}>
      <nav class="solidocs-outline" aria-label="On this page">
        <p class="solidocs-outline-title">On this page</p>
        <ul>
          <For each={meta?.()?.outline ?? []}>
            {entry => (
              <li class={`solidocs-outline-level-${entry.level}`}>
                <a href={`#${entry.id}`}>{entry.text}</a>
              </li>
            )}
          </For>
        </ul>
      </nav>
    </Show>
  )
}
