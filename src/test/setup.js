import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

import { DygraphMock, resetDygraphMock } from './dygraphMock.js'

vi.mock('dygraphs', () => ({ default: DygraphMock }))
vi.mock('dygraphs/dist/dygraph.css', () => ({}))

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverStub

globalThis.requestAnimationFrame = (callback) => globalThis.setTimeout(() => callback(performance.now()), 0)
globalThis.cancelAnimationFrame = (handle) => globalThis.clearTimeout(handle)

if (!window.matchMedia) {
  window.matchMedia = () => ({
    matches: false,
    media: '',
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false
    },
  })
}

afterEach(() => {
  cleanup()
  resetDygraphMock()
})
