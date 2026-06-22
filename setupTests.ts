import '@testing-library/jest-dom'

// polyfill fetch for tests if not provided by environment
if (!globalThis.fetch) {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  globalThis.fetch = (() => Promise.reject(new Error('fetch not implemented'))) as any
}
