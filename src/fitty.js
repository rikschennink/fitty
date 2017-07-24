export default function fitty(target, options = {}) {

	// if target is a string, treat it as a querySelector
	if (typeof target === 'string' && 'querySelector' in document) {
		[].slice.call(document.querySelectorAll(target)).forEach(fitty, options);
		return;
	}

	// set options object
	options = {
		overflowSize: 500, // 500
		rescaleDelay: 100, // 100
		observeWindow: 'addEventListener' in window,
		observeMutations: 'MutationObserver' in window,
		...options
	};

	// content of target element cannot wrap
	target.style.whiteSpace = 'nowrap';

	// overflow available space on purpose, then calculate fitting size
	const scale = (el) => {
		el.style.fontSize = `${options.overflowSize}px`;
		el.style.fontSize = `${(el.parentNode.offsetWidth / el.scrollWidth) * options.overflowSize}px`;
	};

	// initial contain
	scale(target);

	// should we observe the window?
	let rescale = null;
	if (options.observeWindow) {

		// We can rescale when window is resized! \o/
		let scaleTimeout;
		rescale = () => {
			clearTimeout(scaleTimeout);
			scaleTimeout = setTimeout(() => {
				scale(target);
			}, options.rescaleDelay);
		};
		window.addEventListener('resize', rescale);
		window.addEventListener('orientationchange', rescale);
	}

	// should we observe dom mutations
	let observer;
	if (options.observeMutations) {

		// We can rescale when content changes! \o/
		observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				console.log('mutation', mutation.type);
				scale(target);
			});
		});

		observer.observe(target, {
			subtree: true,
			childList: true,
			characterData: true
		});

	}

	// expose API
	return {
		refit: () => {
			scale(target)
		},
		destroy: () => {

			if (options.observeWindow) {
				window.removeEventListener('resize', rescale);
			}

			if (options.observeMutations) {
				observer.disconnect();
			}

			target.style.fontSize = '';
		}
	}

};