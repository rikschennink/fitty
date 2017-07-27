// all active fitty elements
let fitties = [];

// group all redraw calls till next frame, we cancel each frame request when a new one comes in. If no support for request animation frame, this is an empty function and supports for fitty stops.
let redrawFrame = null;
const requestRedraw = 'requestAnimationFrame' in window ? () => {
    cancelAnimationFrame(redrawFrame);
    redrawFrame = requestAnimationFrame(() => {
      redraw(fitties.filter(f => f.dirty));
    });
  } : () => {};

// every fitty element is tested for invalid styles
const computeFittyStyles = fitty => {
  // should pre-style the target element
  let preStyle = false;

  // get style properties
  const style = window.getComputedStyle(fitty.target, null);

  // get current font size in pixels (if we already calculated it, use the calculated version)
  fitty.currentFontSize = parseInt(style.getPropertyValue('font-size'), 10);

  // get display type and wrap mode
  fitty.display = style.getPropertyValue('display');
  if (!/inline-/.test(fitty.display)) {
    preStyle = true;
    fitty.display = 'inline-block';
  }

  fitty.whiteSpace = style.getPropertyValue('white-space');
  if (fitty.whiteSpace !== 'nowrap') {
    preStyle = true;
    fitty.whiteSpace = 'nowrap';
  }

  fitty.styleComputed = true;

  return preStyle;
};

// redraws fitties so they nicely fit their parent container
const redraw = fitties => {

  // check if styles of all fitties have been computed
  fitties
    .filter(f => !f.styleComputed)
    .forEach(f => {
      f.preStyle = computeFittyStyles(f);
    });

  // restyle elements that require pre-styling
  fitties.filter(f => f.preStyle).forEach(style);

  // as we are in the next frame, this request should not trigger a reflow, let's gather as much intel as possible
  fitties.forEach(f => {
    // the available space in the parent container
    f.availableWidth = f.target.parentNode.offsetWidth;

    // the space our target element uses
    f.currentWidth = f.target.scrollWidth;

    // let's calculate the new font size
    f.previousFontSize = f.currentFontSize;
    f.currentFontSize = Math.min(
      Math.max(
          f.minSize,
          (f.availableWidth / f.currentWidth) * f.previousFontSize
      ),
      f.maxSize
    );

    // if allows wrapping, only wrap when using minimum font size (otherwise would break container)
    f.whiteSpace = f.multiLine && f.currentFontSize === f.minSize
      ? 'normal'
      : 'nowrap';
  });

  // now we apply what we've learned in our previous loop
  fitties.forEach(f => {

    // scale to calculated font size
    style(f);

    // no longer dirty
    f.dirty = false;

    // dispatch event
    f.target.dispatchEvent(new CustomEvent('fit', {
      detail:{
        oldValue: f.previousFontSize,
        newValue: f.currentFontSize,
        scaleFactor: f.currentFontSize / f.previousFontSize
      }
    }));
  });
};

// writes style to element
const style = f => {
  f.target.style.cssText = `white-space:${f.whiteSpace};display:${f.display};font-size:${f.currentFontSize}px`;
};

// fit method, marks the fitty as dirty and requests a redraw (this will also redraw any other fitty marked as dirty)
const fit = fitty => {
  fitty.dirty = true;
  requestRedraw();
};

// add a new fitty
const subscribe = fitty => {
  // this is a new fitty so we need to validate if it's styles are in order
  fitty.newbie = true;

  // we want to be able to update this fitty
  fitties.push(fitty);

  // redraw for first time
  fit(fitty);
};

// remove an existing fitty
const unsubscribe = fitty => {
  // remove from fitties array
  fitties = fitties.filter(f => f.target !== fitty.target);

  // stop observing DOM
  if (fitty.observeMutations) {
    fitty.observer.disconnect();
  }

  // reset font size to inherited size
  fitty.target.style.removeProperty('font-size');
};

// default mutation observer settings
const mutationObserverDefaultSetting = {
  subtree: true,
  childList: true,
  characterData: true
};

// is mutation observer available on this browser?
const mutationObserverSupported = 'MutationObserver' in window;

// node list to array
const toArray = (nl) => [].slice.call(nl);

// converts a querySelector an array of fitties
const selectorToFitties = (selector, options) => toArray( document.querySelectorAll(selector) ).map(el => fitty(el, options) );

// fitty creation function
function fitty(target, options = {}) {

  // if target is a string, treat it as a querySelector
  if (typeof target === 'string' && 'querySelectorAll' in document) {
    return selectorToFitties(target, options);
  }

  // create fitty instance
  const f = {

    // defaults
    minSize: options.minSize || 16,
    maxSize: options.maxSize || 512,
    multiLine: options.multiLine !== false,
    observeMutations: options.observeMutations === false
      ? false
      : options.observeMutations || mutationObserverSupported,

    // internal
    target
  };

  // register this fitty
  subscribe(f);

  // should we observe DOM mutations
  if (f.observeMutations) {
    // start observing mutations
    f.observer = new MutationObserver(() => {
      fit(f);
    });

    // use default settings or custom settings
    f.observer.observe(
      target,
      f.observeMutations === true
        ? mutationObserverDefaultSetting
        : f.observeMutations
    );
  }

  // expose API
  return {
    element: target,
    fit: () => {
      fit(f);
    },
    unsubscribe: () => {
      unsubscribe(f);
    }
  };
}

// sets all fitties to dirty and calls redraw
const redrawAll = () => {
  fitties.forEach(f => {
    f.dirty = true;
  });
  requestRedraw();
};

// redraws all fitties but does so after a timeout
let redrawAllTimeout = null;
const redrawAllDelayed = () => {
  clearTimeout(redrawAllTimeout);
  redrawAllTimeout = setTimeout(redrawAll, fitty.observeWindowDelay);
};

// define observe window property
const events = [ 'resize', 'orientationchange' ];
Object.defineProperty(fitty, 'observeWindow', {
  set: enabled => {
    const method = `${enabled ? 'add' : 'remove'}EventListener`;
    events.forEach(e => {
      window[method](e, redrawAllDelayed);
    });
  }
});


// fitty global properties
fitty.observeWindow = true;
fitty.observeWindowDelay = 100;


// public methods
fitty.fitAll = redrawAll;


// export our fitty function, we don't want to keep it to our selves
export default fitty;