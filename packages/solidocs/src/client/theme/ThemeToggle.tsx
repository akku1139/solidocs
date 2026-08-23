import { createSignal, onMount } from "solid-js"

type Theme = "light" | "dark"

const storageKey = "solidocs-theme"

/** Apply a theme to the document root. `undefined` clears the override. */
const apply = (theme?: Theme) => {
  if(theme) document.documentElement.dataset.theme = theme
  else delete document.documentElement.dataset.theme
}

/**
 * Light/dark mode toggle. Without an explicit choice the theme follows
 * `prefers-color-scheme` (handled purely in CSS); the choice is persisted
 * in localStorage under `solidocs-theme`.
 */
export const ThemeToggle = () => {
  const [theme, setTheme] = createSignal<Theme | undefined>(undefined)

  onMount(() => {
    const stored = localStorage.getItem(storageKey) as Theme | null
    if(stored === "light" || stored === "dark") {
      setTheme(stored)
      apply(stored)
    }
  })

  const toggle = () => {
    // Resolve the *effective* theme (system preference if no override).
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const current: Theme = theme() ?? (systemDark ? "dark" : "light")
    const next: Theme = current === "dark" ? "light" : "dark"
    setTheme(next)
    apply(next)
    localStorage.setItem(storageKey, next)
  }

  return (
    <button
      type="button"
      class="solidocs-theme-toggle"
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
      onClick={toggle}
    >
      {/* Shown/hidden via CSS depending on the active theme. */}
      <span class="solidocs-theme-toggle-sun" aria-hidden="true">☀</span>
      <span class="solidocs-theme-toggle-moon" aria-hidden="true">☾</span>
    </button>
  )
}
