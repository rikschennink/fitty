const supportsAddEventListener = 'addEventListener' in window;
const supportsMutationObserver = 'MutationObserver' in window;
const supportsQuerySelector = 'querySelector' in document;

export default function fitty(target) {

	// if target is a string, treat it as a querySelector
	if (typeof target === 'string' && supportsQuerySelector) {
		[].slice.call(document.querySelectorAll(target)).forEach(fitty);
		return;
	}

	// content of target element cannot wrap
	target.style.whiteSpace = 'nowrap';

	// the maximum font size used to calculate the ideal font size
	const OVERFLOW_SIZE = 250;

	// overflow available space on purpose, then calculate fitting size
	const scale = (el) => {
		el.style.fontSize = `${OVERFLOW_SIZE}em`;
		el.style.fontSize = `${(el.parentNode.offsetWidth / el.scrollWidth) * OVERFLOW_SIZE}em`;
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
			}, 100);
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