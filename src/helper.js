/**
 * Provide a function to get current `devicePixelRatio`.
 * `devicePixelRatio` may be modified after browser's zoom
 */
export function getDevicePixelRatio() {
  let dpr = 1
  // If in browser environment
  if (typeof window !== 'undefined') {
    dpr = window.devicePixelRatio || (window.screen.deviceXDPI / window.screen.logicalXDPI) || 1
  }
  return dpr
}

export function supportMatchMedia() {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
}
