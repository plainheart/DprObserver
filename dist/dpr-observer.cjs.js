'use strict';

/**
 * Provide a function to get current `devicePixelRatio`.
 * `devicePixelRatio` may be modified after browser's zoom
 */
function getDevicePixelRatio() {
  var dpr = 1; // If in browser environment

  if (typeof window !== 'undefined') {
    dpr = window.devicePixelRatio || window.screen.deviceXDPI / window.screen.logicalXDPI || 1;
  }

  return dpr;
}
function supportMatchMedia() {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function';
}

var matchMediaSupported = supportMatchMedia();
/**
 * An observer for listening to the change of device pixel ratio
 *
 * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Window/devicePixelRatio
 */

var DprObserver = /*#__PURE__*/function () {
  function DprObserver(onchange) {
    if (!matchMediaSupported) {
      throw new Error('DprObserver cannot run without `matchMedia` supported!');
    }

    if (typeof onchange !== 'function') {
      throw new Error('the required param `onchange` must be a function!');
    }

    this._onchange = onchange;

    this._init();
  }

  var _proto = DprObserver.prototype;

  _proto._init = function _init() {
    var _this = this;

    var dpr = getDevicePixelRatio();
    var mqString = "(resolution: " + dpr + "dppx)";
    this._mediaMatcher = window.matchMedia(mqString);

    this._mediaMatcher.addListener(this._updateListener = function () {
      _this._onchange(getDevicePixelRatio()); // recreate the media mather with the new dpr


      _this._disposeMediaMatcher();

      _this._init();
    });
  };

  _proto._disposeMediaMatcher = function _disposeMediaMatcher() {
    if (this._mediaMatcher) {
      this._mediaMatcher.removeListener(this._updateListener);

      this._mediaMatcher = null;
    }

    this._updateListener = null;
  }
  /**
   * Dispose the observer
   */
  ;

  _proto.dispose = function dispose() {
    this._disposeMediaMatcher();

    this._onchange = null;
  }
  /**
   * Get current device pixel ratio
   * @return {Number} Current device pixel ratio
   */
  ;

  _proto.getDpr = function getDpr() {
    return getDevicePixelRatio();
  };

  return DprObserver;
}();

module.exports = DprObserver;
//# sourceMappingURL=dpr-observer.cjs.js.map
