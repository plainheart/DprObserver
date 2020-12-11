import { version } from '../package.json'
import {
  isFunction,
  getDevicePixelRatio,
  supportMatchMedia,
  requestAnimationFrame,
  cancelAnimationFrame,
  getIEVersion
} from './helper'

const matchMediaSupported = supportMatchMedia()
const isIE = !!getIEVersion()

const defaultOptions = {
  /**
   * Only use animation listener.
   * This works for most of browsers.
   */
  onlyUseAnimationListener: false,
  /**
   * prefer matchMedia and fallback to animation listener if not supported.
   */
  fallbackToAnimationListener: true
}

/**
 * An observer for listening to the change of device pixel ratio
 *
 * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Window/devicePixelRatio
 */
class DprObserver {

  static version = version

  constructor(onchange, options) {
    options = Object.assign({}, defaultOptions, options || {})
    if (!options.onlyUseAnimationListener && !matchMediaSupported && !options.fallbackToAnimationListener) {
      throw new Error(
        `DprObserver cannot run without \`matchMedia\` supported!
        Please try to specify \`fallbackToAnimationListener\` as true to enable animation listener.`
      )
    }
    if (!isFunction(onchange)) {
      throw new Error('the required param `onchange` must be a function!')
    }
    this._onchange = onchange
    // use animation listener
    // if `onlyUseAnimationListener`is specified as true
    // or browser is IE
    // or `matchMedia` is not supported and `fallbackToAnimationListener` is specified as true
    if (options.onlyUseAnimationListener || isIE
      || (!matchMediaSupported && options.fallbackToAnimationListener)
    ) {
      this._createAnimationListener()
    }
    else {
      this._createMediaMatcher()
    }
  }

  // FIXME: seems chrome 49 or older cannot trigger update listener
  _createMediaMatcher() {
    const dpr = getDevicePixelRatio()
    const mqString = `(resolution: ${dpr}dppx)`
    this._mediaMatcher = window.matchMedia(mqString)
    this._mediaMatcher.addListener(
      this._updateListener = () => {
        this._onchange(getDevicePixelRatio())

        // recreate the media mather with the new dpr
        this._disposeMediaMatcher()
        this._createMediaMatcher()
      }
    )
  }

  _createAnimationListener() {
    let dpr = getDevicePixelRatio()
    const func = () => {
      const newDpr = getDevicePixelRatio()
      if (dpr !== newDpr) {
        this._onchange && this._onchange(dpr = newDpr)
      }
      requestAnimationFrame(func)
    }
    this._updateListener = requestAnimationFrame(func)
  }

  _disposeMediaMatcher() {
    if (this._mediaMatcher) {
      this._mediaMatcher.removeListener(this._updateListener)
      this._mediaMatcher = null
    }
  }

  _disposeAnimationListener() {
    this._updateListener && cancelAnimationFrame(this._updateListener)
  }

  /**
   * Dispose the observer
   */
  dispose() {
    this._disposeAnimationListener()
    this._disposeMediaMatcher()
    if (this._updateListener) {
      this._updateListener = null
    }
    this._onchange = null
  }

  /**
   * Get current device pixel ratio
   * @return {Number} Current device pixel ratio
   */
  getDpr() {
    return getDevicePixelRatio()
  }

}

export default DprObserver
