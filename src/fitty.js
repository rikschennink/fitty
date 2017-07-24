const supportsAddEventListener = 'addEventListener' in window;
const supportsMutationObserver = 'MutationObserver' in window;
const supportsQuerySelector = 'querySelector' in document;

export default function fitty(target, options = {}) {

	// if target is a string, treat it as a querySelector
	if (typeof target === 'string' && supportsQuerySelector) {
		[].slice.call(document.querySelectorAll(target)).forEach(fitty, options);
		return;
	}

	// set options object
	options = {
		overflowSize: 250,
		rescaleDelay: 100,
		...options
	};

	// content of target element cannot wrap
	target.style.whiteSpace = 'nowrap';

	// overflow available space on purpose, then calculate fitting size
	// used 'em' before but that caused browser differences
	const scale = (el) => {
		el.style.fontSize = `${options.overflowSize}px`;
		el.style.fontSize = `${(el.parentNode.offsetWidth / el.scrollWidth) * options.overflowSize}px`;
	};

	// initial contain
	scale(target);

	// if no addEventListener available we cannot listen to resize event
	let rescale = null;
	if (supportsAddEventListener) {

		// We can rescale when window is resized! \o/
		let scale_timeout;
		rescale = () => {
			clearTimeout(scale_timeout);
			scale_timeout = setTimeout(() => {
				scale(target);
			}, options.rescaleDelay);
		};
		window.addEventListener('resize', rescale);
		window.addEventListener('orientationchange', rescale);
	}

	// if no MutationObserver available we cannot listen to dom mutations
	let observer;
	if (supportsMutationObserver) {

		// We can rescale when content changes! \o/
		observer = new MutationObserver((mutations) => {
			mutations.forEach(() => {
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
		refit: () => {
			scale(target)
		},
		destroy: () => {
			if (supportsAddEventListener) {
				window.removeEventListener('resize', rescale);
			}
			if (supportsMutationObserver) {
				observer.disconnect();
			}
			target.style.fontSize = '';
		}
	}

};