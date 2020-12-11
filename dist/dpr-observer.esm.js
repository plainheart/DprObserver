function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

var version = "0.0.3";

function isFunction(obj) {
  return obj && typeof obj === 'function';
}
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
  return typeof window !== 'undefined' && isFunction(window.matchMedia);
}
function getIEVersion() {
  var version = 0;
  var ua = navigator.userAgent;

  if (navigator.appName === 'Microsoft Internet Explorer') {
    new RegExp('MSIE ([0-9]{1,}[.0-9]{0,})').exec(ua);
    version = parseFloat(RegExp.$1);
  } else if (ua.indexOf('Trident') > -1 && ua.indexOf('rv:11.0') > -1) {
    version = 11;
  }

  return version;
}
var requestAnimationFrame = typeof window !== 'undefined' && (window.requestAnimationFrame && window.requestAnimationFrame.bind(window) || window.msRequestAnimationFrame && window.msRequestAnimationFrame.bind(window) || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame) || function (func) {
  return setTimeout(func, 16);
};
var cancelAnimationFrame = typeof window !== 'undefined' && (window.cancelAnimationFrame && window.cancelAnimationFrame.bind(window) || window.msCancelAnimationFrame && window.msCancelAnimationFrame.bind(window) || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame) || function (handle) {
  return clearTimeout(handle);
};

var matchMediaSupported = supportMatchMedia();
var isIE = !!getIEVersion();
var defaultOptions = {
  /**
   * Only use animation listener.
   * This works for most of browsers.
   */
  onlyUseAnimationListener: false,

  /**
   * prefer matchMedia and fallback to animation listener if not supported.
   */
  fallbackToAnimationListener: true
};
/**
 * An observer for listening to the change of device pixel ratio
 *
 * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Window/devicePixelRatio
 */

var DprObserver = /*#__PURE__*/function () {
  function DprObserver(onchange, options) {
    options = _extends({}, defaultOptions, options || {});

    if (!options.onlyUseAnimationListener && !matchMediaSupported && !options.fallbackToAnimationListener) {
      throw new Error("DprObserver cannot run without `matchMedia` supported!\n        Please try to specify `fallbackToAnimationListener` as true to enable animation listener.");
    }

    if (!isFunction(onchange)) {
      throw new Error('the required param `onchange` must be a function!');
    }

    this._onchange = onchange; // use animation listener
    // if `onlyUseAnimationListener`is specified as true
    // or browser is IE
    // or `matchMedia` is not supported and `fallbackToAnimationListener` is specified as true

    if (options.onlyUseAnimationListener || isIE || !matchMediaSupported && options.fallbackToAnimationListener) {
      this._createAnimationListener();
    } else {
      this._createMediaMatcher();
    }
  }

  var _proto = DprObserver.prototype;

  _proto._createMediaMatcher = function _createMediaMatcher() {
    var _this = this;

    var dpr = getDevicePixelRatio();
    var mqString = "(resolution: " + dpr + "dppx)";
    this._mediaMatcher = window.matchMedia(mqString);

    this._mediaMatcher.addListener(this._updateListener = function () {
      _this._onchange(getDevicePixelRatio()); // recreate the media mather with the new dpr


      _this._disposeMediaMatcher();

      _this._createMediaMatcher();
    });
  };

  _proto._createAnimationListener = function _createAnimationListener() {
    var _this2 = this;

    var dpr = getDevicePixelRatio();

    var func = function func() {
      var newDpr = getDevicePixelRatio();

      if (dpr !== newDpr) {
        _this2._onchange && _this2._onchange(dpr = newDpr);
      }

      requestAnimationFrame(func);
    };

    this._updateListener = requestAnimationFrame(func);
  };

  _proto._disposeMediaMatcher = function _disposeMediaMatcher() {
    if (this._mediaMatcher) {
      this._mediaMatcher.removeListener(this._updateListener);

      this._mediaMatcher = null;
    }
  };

  _proto._disposeAnimationListener = function _disposeAnimationListener() {
    this._updateListener && cancelAnimationFrame(this._updateListener);
  }
  /**
   * Dispose the observer
   */
  ;

  _proto.dispose = function dispose() {
    this._disposeAnimationListener();

    this._disposeMediaMatcher();

    if (this._updateListener) {
      this._updateListener = null;
    }

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

_defineProperty(DprObserver, "version", version);

export default DprObserver;
//# sourceMappingURL=dpr-observer.esm.js.map
