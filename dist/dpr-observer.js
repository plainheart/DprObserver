(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.DprObserver = factory());
}(this, (function () { 'use strict';

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

  var version = "0.0.5";

  function isFunction(obj) {
    return obj && typeof obj === 'function';
  }
  function isString(obj) {
    return typeof obj === 'string';
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
  var on = function () {
    if (document.addEventListener) {
      return function (element, event, handler) {
        if (element && event && handler) {
          element.addEventListener(event, handler, false);
        }
      };
    } else {
      return function (element, event, handler) {
        if (element && event && handler) {
          element.attachEvent('on' + event, handler);
        }
      };
    }
  }();
  var off = function () {
    if (document.removeEventListener) {
      return function (element, event, handler) {
        if (element && event) {
          element.removeEventListener(event, handler, false);
        }
      };
    } else {
      return function (element, event, handler) {
        if (element && event) {
          element.detachEvent('on' + event, handler);
        }
      };
    }
  }();

  var matchMediaSupported = supportMatchMedia();
  var isIE = !!getIEVersion();
  var TECH_MATCH_MEDIA = 'matchMedia';
  var TECH_ANIMATION_FRAME = 'animationFrame';
  var TECH_RESIZE = 'resize';
  var TECH = [TECH_MATCH_MEDIA, TECH_ANIMATION_FRAME, TECH_RESIZE];
  var defaultOptions = {
    tech: TECH,
    preferResize: false,
    fallback: true
  };
  /**
   * An observer for listening to the change of device pixel ratio
   *
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Window/devicePixelRatio
   */

  var DprObserver = /*#__PURE__*/function () {
    function DprObserver(onchange, options) {
      // check onchange callback function
      if (!isFunction(onchange)) {
        throw new Error('the required param `onchange` must be a function!');
      }

      this._onchange = onchange; // check options

      options = _extends({}, defaultOptions, options || {});
      var tech = options.tech || TECH;

      if (isString(tech)) {
        if (TECH.indexOf(tech) === -1) {
          throw new Error("Unsupported tech `" + tech + "`. Only " + TECH.join(', ') + " supported.");
        }

        if (tech.indexOf(',') !== -1) {
          tech = tech.split(',');
        }
      } // if prefer resize tech


      if (options.preferResize) {
        if (tech.indexOf(TECH_RESIZE) === -1) {
          tech.unshift(TECH_RESIZE);
        } else {
          tech = TECH_RESIZE.concat(tech.filter(t !== TECH_RESIZE));
        }
      }

      var techLen = tech.length;
      var fallback;

      for (var i = 0, _t; i < techLen; i++) {
        _t = tech[i];

        if (TECH.indexOf(_t) !== -1) {
          if (this._init(_t)) {
            console.log(fallback ? "fallback to the `" + _t + "` tech." : "`" + _t + "` tech is currently used.");
            break;
          }

          if (!options.fallback) {
            throw new Error("The tech `" + _t + "` seems to be not supported. Please enable `fallback` to try others techs.");
          }

          fallback = true;
          console.warn("The tech `" + _t + "` seems to be not supported.");
        } else {
          console.warn("Unsupported tech `" + _t + "`.");
        }
      }
    }

    var _proto = DprObserver.prototype;

    _proto._init = function _init(tech) {
      switch (tech) {
        case TECH_RESIZE:
          this._createResizeListener();

          break;

        case TECH_MATCH_MEDIA:
          // don't use matchMedia in IE even if it supports
          if (!matchMediaSupported || isIE) {
            return false;
          }

          this._createMediaMatcher();

          break;

        case TECH_ANIMATION_FRAME:
          this._createAnimationListener();

          break;
      }

      return true;
    };

    _proto._createResizeListener = function _createResizeListener() {
      var _this = this;

      var dpr = getDevicePixelRatio();
      on(window, 'resize', this._updateListener = function (e) {
        var newDpr = getDevicePixelRatio();

        if (dpr !== newDpr) {
          _this._onchange && _this._onchange({
            tech: TECH_RESIZE,
            oldDpr: dpr,
            dpr: dpr = newDpr,
            event: e
          });
        }
      });
    } // FIXME: seems chrome 49 or older cannot trigger update listener
    ;

    _proto._createMediaMatcher = function _createMediaMatcher() {
      var _this2 = this;

      var dpr = getDevicePixelRatio();
      var mqString = "(resolution: " + dpr + "dppx)";
      this._mediaMatcher = window.matchMedia(mqString);

      this._mediaMatcher.addListener(this._updateListener = function (e) {
        var newDpr = getDevicePixelRatio();

        _this2._onchange({
          tech: TECH_MATCH_MEDIA,
          oldDpr: dpr,
          dpr: dpr = newDpr,
          event: e
        }); // recreate the media mather with the new dpr


        _this2._disposeMediaMatcher();

        _this2._createMediaMatcher();
      });
    };

    _proto._createAnimationListener = function _createAnimationListener() {
      var _this3 = this;

      var dpr = getDevicePixelRatio();

      var func = function func(e) {
        var newDpr = getDevicePixelRatio();

        if (dpr !== newDpr) {
          _this3._onchange && _this3._onchange({
            tech: TECH_ANIMATION_FRAME,
            oldDpr: dpr,
            dpr: dpr = newDpr,
            event: {
              handle: _this3._updateListener,
              ts: e
            }
          });
        }

        requestAnimationFrame(func);
      };

      this._updateListener = requestAnimationFrame(func);
    };

    _proto._disposeResizeListener = function _disposeResizeListener() {
      this._updateListener && off(window, 'resize', this._updateListener);
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

      this._disposeResizeListener();

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

    DprObserver.getDpr = function getDpr() {
      return getDevicePixelRatio();
    };

    return DprObserver;
  }();

  _defineProperty(DprObserver, "version", version);

  _defineProperty(DprObserver, "TECH_RESIZE", TECH_RESIZE);

  _defineProperty(DprObserver, "TECH_MATCH_MEDIA", TECH_MATCH_MEDIA);

  _defineProperty(DprObserver, "TECH_ANIMATION_FRAME", TECH_ANIMATION_FRAME);

  return DprObserver;

})));
//# sourceMappingURL=dpr-observer.js.map
