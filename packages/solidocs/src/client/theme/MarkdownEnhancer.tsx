import { onCleanup, onMount } from "solid-js"

/**
 * Enhances every code block with a copy button and every heading with
 * a hover anchor link. Runs once after hydration; delegated events
 * keep it working for lazily loaded pages.
 */
export const MarkdownEnhancer = () => {
  onMount(() => {
    const doc = document

    /** Copy button for code blocks (delegated). */
    const timers = new Set<ReturnType<typeof setTimeout>>()
    const flashCopied = (button: HTMLElement) => {
      button.textContent = "Copied!"
      button.classList.add("is-copied")
      timers.add(setTimeout(() => {
        button.textContent = "Copy"
        button.classList.remove("is-copied")
        timers.delete(timers.values().next().value as ReturnType<typeof setTimeout>)
      }, 1600))
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if(target.classList.contains("solidocs-copy-btn")) {
        event.preventDefault()
        if(!navigator.clipboard) {
          // Clipboard API needs a secure context; degrade quietly.
          return
        }
        const pre = target.closest("pre")
        const text = pre?.querySelector("code")?.textContent ?? ""
        void navigator.clipboard.writeText(text).then(() => flashCopied(target))
        return
      }
      // Heading anchor click: copy the full url.
      if(target.classList.contains("solidocs-anchor")) {
        const heading = target.closest("h1, h2, h3, h4, h5, h6")
        if(heading?.id) {
          const url = new URL(heading.id, location.href).href
          void navigator.clipboard.writeText(url)
        }
      }
    }

    doc.addEventListener("click", onClick)

    /** Attach copy buttons to existing <pre> blocks. */
    const attachCopyButtons = () => {
      for(const pre of Array.from(doc.querySelectorAll("pre:not(.has-copy-btn)"))) {
        pre.classList.add("has-copy-btn")
        const button = doc.createElement("button")
        button.className = "solidocs-copy-btn"
        button.type = "button"
        button.textContent = "Copy"
        button.setAttribute("aria-label", "Copy code to clipboard")
        pre.appendChild(button)
      }
    }
    attachCopyButtons()

    /** Observe the article for route changes (lazy page swaps). */
    const observer = new MutationObserver(() => attachCopyButtons())
    const root = doc.getElementById("root")
    if(root) observer.observe(root, { childList: true, subtree: true })

    onCleanup(() => {
      doc.removeEventListener("click", onClick)
      observer.disconnect()
      for(const timer of timers) clearTimeout(timer)
    })
  })

  return null
}
