const addEvent = (element, type, cb) => {
	if (element.addEventListener) {
		element.addEventListener(type, cb);
	}
	else {
		element.attachEvent(`on${type}`, cb);
	}
};

const removeEvent = (element, type, cb) => {
	if (element.removeEventListener) {
		element.removeEventListener(type, cb);
	}
	else {
		element.detachEvent(`on${type}`, cb);
	}
};

export default function fitty(target, options = {}) {

	// if target is a string, treat it as a querySelector
	if (typeof target === 'string' && 'querySelectorAll' in document) {
		const nodeList = document.querySelectorAll(target);
		for (let i = 0; i < nodeList.length; i++) {
			fitty(nodeList[i], options);
		}
		return;
	}

	// set options object
	options = {
		overflowSize: 500, // 500
		rescaleDelay: 100, // 100
		observeWindow: true,
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
		addEvent(window, 'resize', rescale);
		addEvent(window, 'orientationchange', rescale);
	}

	// should we observe dom mutations
	let observer;
	if (options.observeMutations) {

		// We can rescale when content changes! \o/
		observer = new MutationObserver((mutations) => {
			mutations.forEach(() => {
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
				removeEvent(window, 'resize', rescale);
			}

			if (options.observeMutations) {
				observer.disconnect();
			}

			target.style.fontSize = '';
		}
	}

};