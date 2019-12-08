// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"xiRv":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MediaElementSyncer = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var EVENTS = ['play', 'pause', 'seeking', 'seeked', 'playing', 'stalled'];

var MediaElementSyncer =
/*#__PURE__*/
function () {
  function MediaElementSyncer(source) {
    var _this = this;

    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$refreshInterval = _ref.refreshInterval,
        refreshInterval = _ref$refreshInterval === void 0 ? 200 : _ref$refreshInterval,
        _ref$correctionTime = _ref.correctionTime,
        correctionTime = _ref$correctionTime === void 0 ? 500 : _ref$correctionTime,
        _ref$seekThreshold = _ref.seekThreshold,
        seekThreshold = _ref$seekThreshold === void 0 ? 1000 : _ref$seekThreshold;

    _classCallCheck(this, MediaElementSyncer);

    this._source = source;
    this._children = [];
    this._updateTimer = null;
    this._refreshInterval = refreshInterval;
    this._correctionTime = correctionTime / 1000;
    this._seekThreshold = seekThreshold / 1000;
    this._config = new Map();
    var collecting = false;

    this._eventHandler = function () {
      if (collecting) {
        return;
      }

      collecting = true;
      window.setTimeout(function () {
        collecting = false;

        _this._update();
      }, 0);
    };
  }

  _createClass(MediaElementSyncer, [{
    key: "addChild",
    value: function addChild(element) {
      var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref2$offset = _ref2.offset,
          offset = _ref2$offset === void 0 ? 0 : _ref2$offset;

      if (this._children.indexOf(element) === -1) {
        if (!this._children.length) {
          this._addEventListeners(this._source);
        }

        this._config.set(element, {
          offset: offset
        });

        this._children.push(element);

        this._addEventListeners(element);

        this._update();
      }
    }
  }, {
    key: "removeChild",
    value: function removeChild(element) {
      var index = this._children.indexOf(element);

      if (index >= 0) {
        this._config.delete(element);

        this._removeEventListeners(element);

        this._children.splice(index, 1);

        if (!this._children.length) {
          if (this._updateTimer) {
            window.clearTimeout(this._updateTimer);
            this._updateTimer = null;
          }

          this._removeEventListeners(this._source);
        }
      }
    }
  }, {
    key: "_update",
    value: function _update() {
      var _this2 = this;

      if (this._updateTimer) {
        window.clearTimeout(this._updateTimer);
      }

      if (!this._children.length) {
        return;
      }

      var sourceTime = this._source.currentTime;
      var sourcePlaybackRate = this._source.playbackRate;

      this._children.forEach(function (child) {
        try {
          var config = _this2._config.get(child);

          var targetTime = sourceTime + config.offset / 1000;
          var sourcePaused = _this2._source.paused || _this2._source.ended || targetTime < 0 || targetTime >= child.duration;
          var currentTime = child.currentTime;
          var diff = targetTime - currentTime;
          var rate = Math.max(0, (diff + _this2._correctionTime) / _this2._correctionTime * sourcePlaybackRate);

          if (sourcePaused !== child.paused) {
            sourcePaused ? child.pause() : child.play();
          }

          if (sourcePaused || rate < 0 || Math.abs(diff) >= _this2._seekThreshold) {
            child.currentTime = targetTime;
            child.playbackRate = sourcePlaybackRate;
          } else {
            child.playbackRate = rate;
          }
        } catch (e) {
          window.setTimeout(function () {
            throw e;
          }, 0);
        }
      });

      this._updateTimer = window.setTimeout(function () {
        return _this2._update();
      }, this._refreshInterval);
    }
  }, {
    key: "_addEventListeners",
    value: function _addEventListeners(element) {
      var _this3 = this;

      EVENTS.forEach(function (eventName) {
        return element.addEventListener(eventName, _this3._eventHandler);
      });
    }
  }, {
    key: "_removeEventListeners",
    value: function _removeEventListeners(element) {
      var _this4 = this;

      EVENTS.forEach(function (eventName) {
        return element.removeEventListener(eventName, _this4._eventHandler);
      });
    }
  }]);

  return MediaElementSyncer;
}();

exports.MediaElementSyncer = MediaElementSyncer;
},{}]},{},["xiRv"], "MediaElementSyncer")
//# sourceMappingURL=/media-element-syncer.js.map