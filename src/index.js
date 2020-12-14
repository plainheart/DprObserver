import { version } from '../package.json'
import {
  isFunction,
  isString,
  getDevicePixelRatio,
  supportMatchMedia,
  requestAnimationFrame,
  cancelAnimationFrame,
  getIEVersion,
  on,
  off
} from './helper'

const matchMediaSupported = supportMatchMedia()
const isIE = !!getIEVersion()

const TECH_MATCH_MEDIA = 'matchMedia'
const TECH_ANIMATION_FRAME = 'animationFrame'
const TECH_RESIZE = 'resize'
const TECH = [TECH_MATCH_MEDIA, TECH_ANIMATION_FRAME, TECH_RESIZE]

const defaultOptions = {
  tech: TECH,
  preferResize: false,
  fallback: true
}

/**
 * An observer for listening to the change of device pixel ratio
 *
 * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Window/devicePixelRatio
 */
class DprObserver {

  static version = version

  static TECH_RESIZE = TECH_RESIZE
  static TECH_MATCH_MEDIA = TECH_MATCH_MEDIA
  static TECH_ANIMATION_FRAME = TECH_ANIMATION_FRAME

  constructor(onchange, options) {
    // check onchange callback function
    if (!isFunction(onchange)) {
      throw new Error('the required param `onchange` must be a function!')
    }
    this._onchange = onchange
    // check options
    options = Object.assign({}, defaultOptions, options || {})
    let tech = options.tech || TECH
    if (isString(tech)) {
     if (!TECH.indexOf(tech) === -1) {
       throw new Error(`unsupported tech \`${tech}\`, only ${TECH.join(', ')} supported.`)
     }
     if (tech.indexOf(',') !== -1) {
       tech = tech.split(',')
     }
    }
    // if prefer resize tech
    if (options.preferResize) {
      if (tech.indexOf(TECH_RESIZE) === -1) {
        tech.unshift(TECH_RESIZE)
      }
      else {
        tech = TECH_RESIZE.concat(tech.filter(t !== TECH_RESIZE))
      }
    }
    const techLen = tech.length
    let fallback
    for (let i = 0, t; i < techLen; i++) {
      t = tech[i]
      if (TECH.indexOf(t) !== -1) {
        if (this._init(t)) {
          console.log(fallback ? `fallback to the \`${t}\` tech.` : `\`${t}\` tech is currently used.`)
          break
        }
        if (!options.fallback) {
          throw new Error(
            `The tech \`${t}\` seems to be not supported. Please enable \`fallback\` to try others techs.`
          )
        }
        fallback = true
        console.warn(`The tech \`${t}\` seems to be not supported.`)
      }
      else {
        console.warn(`Unsupported tech \`${t}\`.`)
      }
    }
  }

  _init(tech) {
    switch (tech) {
      case TECH_RESIZE:
        this._createResizeListener()
        break
      case TECH_MATCH_MEDIA:
        // don't use matchMedia in IE even if it supports
        if (!matchMediaSupported || isIE) {
          return false
        }
        this._createMediaMatcher()
        break
      case TECH_ANIMATION_FRAME:
        this._createAnimationListener()
        break
    }
    return true
  }

  _createResizeListener() {
    let dpr = getDevicePixelRatio()
    on(window, 'resize', this._updateListener = e => {
      const newDpr = getDevicePixelRatio()
      if (dpr !== newDpr) {
        this._onchange && this._onchange({
          tech: TECH_RESIZE,
          oldDpr: dpr,
          dpr: dpr = newDpr,
          event: e
        })
      }
    })
  }

  // FIXME: seems chrome 49 or older cannot trigger update listener
  _createMediaMatcher() {
    let dpr = getDevicePixelRatio()
    const mqString = `(resolution: ${dpr}dppx)`
    this._mediaMatcher = window.matchMedia(mqString)
    this._mediaMatcher.addListener(
      this._updateListener = e => {
        const newDpr = getDevicePixelRatio()
        this._onchange({
          tech: TECH_MATCH_MEDIA,
          oldDpr: dpr,
          dpr: dpr = newDpr,
          event: e
        })

        // recreate the media mather with the new dpr
        this._disposeMediaMatcher()
        this._createMediaMatcher()
      }
    )
  }

  _createAnimationListener() {
    let dpr = getDevicePixelRatio()
    const func = e => {
      const newDpr = getDevicePixelRatio()
      if (dpr !== newDpr) {
        this._onchange && this._onchange({
          tech: TECH_ANIMATION_FRAME,
          oldDpr: dpr,
          dpr: dpr = newDpr,
          event: {
            handle: this._updateListener,
            ts: e
          }
        })
      }
      requestAnimationFrame(func)
    }
    this._updateListener = requestAnimationFrame(func)
  }

  _disposeResizeListener() {
    this._updateListener && off(window, 'resize', this._updateListener)
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
    this._disposeResizeListener()
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

  static getDpr() {
    return getDevicePixelRatio()
  }

}

export default DprObserver
