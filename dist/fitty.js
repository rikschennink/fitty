/*
 * fitty v1.0.0 - Fits text in parent container
 * Copyright (c) 2017 undefined - https://github.com/rikschennink/fitty#readme
 */
(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['module', 'exports'], factory);
	} else if (typeof exports !== "undefined") {
		factory(module, exports);
	} else {
		var mod = {
			exports: {}
		};
		factory(mod, mod.exports);
		global.fitty = mod.exports;
	}
})(this, function (module, exports) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = fitty;

	var _extends = Object.assign || function (target) {
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

	var supportsAddEventListener = 'addEventListener' in window;
	var supportsMutationObserver = 'MutationObserver' in window;
	var supportsQuerySelector = 'querySelector' in document;

	function fitty(target) {
		var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


		// if target is a string, treat it as a querySelector
		if (typeof target === 'string' && supportsQuerySelector) {
			[].slice.call(document.querySelectorAll(target)).forEach(fitty, options);
			return;
		}

		// set options object
		options = _extends({
			overflowSize: 250,
			rescaleDelay: 100
		}, options);

		// content of target element cannot wrap
		target.style.whiteSpace = 'nowrap';

		// overflow available space on purpose, then calculate fitting size
		// used 'em' before but that caused browser differences
		var scale = function scale(el) {
			el.style.fontSize = options.overflowSize + 'px';
			el.style.fontSize = el.parentNode.offsetWidth / el.scrollWidth * options.overflowSize + 'px';
		};

		// initial contain
		scale(target);

		// if no addEventListener available we cannot listen to resize event
		var rescale = null;
		if (supportsAddEventListener) {

			// We can rescale when window is resized! \o/
			var scale_timeout = void 0;
			rescale = function rescale() {
				clearTimeout(scale_timeout);
				scale_timeout = setTimeout(function () {
					scale(target);
				}, options.rescaleDelay);
			};
			window.addEventListener('resize', rescale);
			window.addEventListener('orientationchange', rescale);
		}

		// if no MutationObserver available we cannot listen to dom mutations
		var observer = void 0;
		if (supportsMutationObserver) {

			// We can rescale when content changes! \o/
			observer = new MutationObserver(function (mutations) {
				mutations.forEach(function () {
					scale(target);
				});
			});

			observer.observe(target, {
				attributes: true,
				subtree: true,
				childList: true,
				characterData: true,
				attributeFilter: []
			});
		}

		// expose API
		return {
			refit: function refit() {
				scale(target);
			},
			destroy: function destroy() {
				if (supportsAddEventListener) {
					window.removeEventListener('resize', rescale);
				}
				if (supportsMutationObserver) {
					observer.disconnect();
				}
				target.style.fontSize = '';
			}
		};
	};
	module.exports = exports['default'];
});