import { vi } from 'vitest'

/** Instances created through the mocked `Dygraph` constructor, oldest first. */
export const dygraphInstances = []

/**
 * Minimal stand-in for the `dygraphs` default export. Records every call so a
 * test can assert the wrapper creates one instance per mount, updates rows via
 * `updateOptions({ file })` and destroys the instance on unmount.
 */
export const DygraphMock = vi.fn(function DygraphMock(container, data, options) {
  const instance = {
    container,
    data,
    options,
    updateOptions: vi.fn((next) => {
      if (next?.file) instance.data = next.file
      Object.assign(instance.options, next)
    }),
    destroy: vi.fn(),
    isZoomed: vi.fn(() => false),
    clearSelection: vi.fn(),
    setSelection: vi.fn(),
    resetZoom: vi.fn(),
    resize: vi.fn(),
    setVisibility: vi.fn(),
    setAnnotations: vi.fn(),
    toDomYCoord: vi.fn(() => 0),
  }
  dygraphInstances.push(instance)
  return instance
})

/** Reset recorded instances and call history between tests. */
export function resetDygraphMock() {
  dygraphInstances.length = 0
  DygraphMock.mockClear()
}
