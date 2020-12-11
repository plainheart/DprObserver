import { getDevicePixelRatio, supportMatchMedia } from './helper'

const matchMediaSupported = supportMatchMedia()

/**
 * An observer for listening to the change of device pixel ratio
 *
 * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Window/devicePixelRatio
 */
class DprObserver {

  constructor(onchange) {
    if (!matchMediaSupported) {
      throw new Error('DprObserver cannot run without `matchMedia` supported!')
    }
    if (typeof onchange !== 'function') {
      throw new Error('the required param `onchange` must be a function!')
    }
    this._onchange = onchange
    this._init()
  }

  _init() {
    const dpr = getDevicePixelRatio()
    const mqString = `(resolution: ${dpr}dppx)`
    this._mediaMatcher = window.matchMedia(mqString)
    this._mediaMatcher.addListener(
      this._updateListener = () => {
        this._onchange(getDevicePixelRatio())

        // recreate the media mather with the new dpr
        this._disposeMediaMatcher()
        this._init()
      }
    )
  }

  _disposeMediaMatcher() {
    if (this._mediaMatcher) {
      this._mediaMatcher.removeListener(this._updateListener)
      this._mediaMatcher = null
    }
    this._updateListener = null
  }

  /**
   * Dispose the observer
   */
  dispose() {
    this._disposeMediaMatcher()
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
