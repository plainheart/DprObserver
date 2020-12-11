export function isFunction(obj) {
  return obj && typeof obj === 'function'
}

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
  return typeof window !== 'undefined' && isFunction(window.matchMedia)
}

export function getIEVersion() {
  let version = 0
  const ua = navigator.userAgent
  if (navigator.appName === 'Microsoft Internet Explorer') {
    new RegExp('MSIE ([0-9]{1,}[.0-9]{0,})').exec(ua)
    version = parseFloat(RegExp.$1)
  }
  else if (ua.indexOf('Trident') > -1 && ua.indexOf('rv:11.0') > -1) {
    version = 11
  }
  return version
}

export const requestAnimationFrame = (
  typeof window !== 'undefined'
    && (
      (window.requestAnimationFrame && window.requestAnimationFrame.bind(window))
      || (window.msRequestAnimationFrame && window.msRequestAnimationFrame.bind(window))
      || window.mozRequestAnimationFrame
      || window.webkitRequestAnimationFrame
    )
) || function (func) {
  return setTimeout(func, 16)
}

export const cancelAnimationFrame = (
  typeof window !== 'undefined'
    && (
      (window.cancelAnimationFrame && window.cancelAnimationFrame.bind(window))
      || (window.msCancelAnimationFrame && window.msCancelAnimationFrame.bind(window))
      || window.mozCancelAnimationFrame
      || window.webkitCancelAnimationFrame
    )
) || function (handle) {
  return clearTimeout(handle)
}
