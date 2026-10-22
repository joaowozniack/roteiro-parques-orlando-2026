export type Theme = 'dark' | 'light'
export const THEME_KEY = `orlando-guide:${import.meta.env.BASE_URL}:theme:v1`

export function readTheme(): Theme {
  try { return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark' }
  catch { return 'dark' }
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#f3f6fa' : '#0b1423')
}
