export default ((w) => {

  // no window, early exit
  if (!w) return;

  // node list to array helper method
  const toArray = nl => [].slice.call(nl);

  // states
  const DrawState = {
    IDLE: 0,
    DIRTY_CONTENT: 1,
    DIRTY_LAYOUT: 2,
    DIRTY: 3
  };

  // all active fitty elements
  let fitties = [];

  // group all redraw calls till next frame, we cancel each frame request when a new one comes in. If no support for request animation frame, this is an empty function and supports for fitty stops.
  let redrawFrame = null;
  const requestRedraw = 'requestAnimationFrame' in w ? () => {
      w.cancelAnimationFrame(redrawFrame);
      redrawFrame = w.requestAnimationFrame(() => redraw(fitties.filter(f => f.dirty && f.active)));
    } : () => {};


  // sets all fitties to dirty so they are redrawn on the next redraw loop, then calls redraw
  const redrawAll = (type) => () => {
    fitties.forEach(f => f.dirty = type);
    requestRedraw();
  };


  // redraws fitties so they nicely fit their parent container
  const redraw = fitties => {

    // getting info from the DOM at this point should not trigger a reflow, let's gather as much intel as possible before triggering a reflow

    // check if styles of all fitties have been computed
    fitties
      .filter(f => !f.styleComputed)
      .forEach(f => { f.styleComputed = computeStyle(f) });

    // restyle elements that require pre-styling, this triggers a reflow, please try to prevent by adding CSS rules (see docs)
    fitties
      .filter(shouldPreStyle)
      .forEach(applyStyle);

    // we now determine which fitties should be redrawn
    const fittiesToRedraw = fitties.filter(shouldRedraw);
    
    // we calculate final styles for these fitties
    fittiesToRedraw.forEach(calculateStyles);

    // now we apply the calculated styles from our previous loop
    fittiesToRedraw.forEach(f => {
      applyStyle(f);
      markAsClean(f);
    });

    // now we dispatch events for all restyled fitties
    fittiesToRedraw.forEach(dispatchFitEvent);
  };

  const markAsClean = f => f.dirty = DrawState.IDLE;

  const calculateStyles = f => {

    // get available width from parent node
    f.availableWidth = f.element.parentNode.clientWidth;

    f.availableHeight = f.element.parentNode.clientHeight;

    // the space our target element uses
    f.currentWidth = f.element.scrollWidth;

    f.currentHeight = f.element.scrollHeight;

    // remember current font size
    f.previousFontSize = f.currentFontSize;

    // let's calculate the new font size
    f.currentFontSize = Math.min(
      Math.max(
        f.minSize,
        f.fitHeight
          ? Math.min(
              (f.availableWidth / f.currentWidth) * f.previousFontSize,
              (f.availableHeight / f.currentHeight) * f.previousFontSize
            )
          : (f.availableWidth / f.currentWidth) * f.previousFontSize
      ),
      f.maxSize
    );

    // if allows wrapping, only wrap when at minimum font size (otherwise would break container)
    f.whiteSpace = f.multiLine && f.currentFontSize === f.minSize
      ? 'normal'
      : 'nowrap';

  };

  // should always redraw if is not dirty layout, if is dirty layout, only redraw if size has changed
  const shouldRedraw = f => f.dirty !== DrawState.DIRTY_LAYOUT || (f.dirty === DrawState.DIRTY_LAYOUT && f.element.parentNode.clientWidth !== f.availableWidth);

  // every fitty element is tested for invalid styles
  const computeStyle = f => {

    // get style properties
    const style = w.getComputedStyle(f.element, null);

    // get current font size in pixels (if we already calculated it, use the calculated version)
    f.currentFontSize = parseInt(style.getPropertyValue('font-size'), 10);

    // get display type and wrap mode
    f.display = style.getPropertyValue('display');
    f.whiteSpace = style.getPropertyValue('white-space');
  };


  // determines if this fitty requires initial styling, can be prevented by applying correct styles through CSS
  const shouldPreStyle = f => {

    let preStyle = false;

    // if we already tested for prestyling we don't have to do it again
    if (f.preStyleTestCompleted) return false;

    // should have an inline style, if not, apply
    if (!/inline-/.test(f.display)) {
      preStyle = true;
      f.display = 'inline-block';
    }

    // to correctly calculate dimensions the element should have whiteSpace set to nowrap
    if (f.whiteSpace !== 'nowrap') {
      preStyle = true;
      f.whiteSpace = 'nowrap';
    }

    // we don't have to do this twice
    f.preStyleTestCompleted = true;

    return preStyle;
  };


  // apply styles to single fitty
  const applyStyle = f => {

    // remember original style, we need this to restore the fitty style when unsubscribing
    if (!f.originalStyle) f.originalStyle = f.element.getAttribute('style') || '';

    // set the new style to the original style plus the fitty styles
    f.element.style.cssText = `${f.originalStyle};white-space:${f.whiteSpace};display:${f.display};font-size:${f.currentFontSize}px`;
  };


  // dispatch a fit event on a fitty
  const dispatchFitEvent = f => {
    f.element.dispatchEvent(new CustomEvent('fit', {
      detail:{
        oldValue: f.previousFontSize,
        newValue: f.currentFontSize,
        scaleFactor: f.currentFontSize / f.previousFontSize
      }
    }));
  };


  // fit method, marks the fitty as dirty and requests a redraw (this will also redraw any other fitty marked as dirty)
  const fit = (f, type) => () => {
    f.dirty = type;
    if (!f.active) return;
    requestRedraw();
  };

  const init = f => {

    // should we observe DOM mutations
    observeMutations(f);

    // this is a new fitty so we need to validate if it's styles are in order
    f.newbie = true;

    // because it's a new fitty it should also be dirty, we want it to redraw on the first loop
    f.dirty = true;

    // we want to be able to update this fitty
    fitties.push(f);
  }

  const destroy = f => () => {

    // remove from fitties array
    fitties = fitties.filter(_ => _.element !== f.element);

    // stop observing DOM
    if (f.observeMutations) f.observer.disconnect();

    // reset font size to inherited size
    f.element.style.cssText = f.originalStyle;
  };

  // add a new fitty, does not redraw said fitty
  const subscribe = f => () => {
    if (f.active) return;
    f.active = true;
    requestRedraw();
  };

  // remove an existing fitty
  const unsubscribe = f => () => f.active = false;

  const observeMutations = f => {

    // no observing?
    if (!f.observeMutations) return;

    // start observing mutations
    f.observer = new MutationObserver(fit(f, DrawState.DIRTY_CONTENT));

    // start observing
    f.observer.observe(
      f.element,
      f.observeMutations
    );

  };


  // default mutation observer settings
  const mutationObserverDefaultSetting = {
    subtree: true,
    childList: true,
    characterData: true
  };


  // default fitty options
  const defaultOptions = {
    minSize: 16,
    maxSize: 512,
    fitHeight: false,
    multiLine: true,
    observeMutations: 'MutationObserver' in w ? mutationObserverDefaultSetting : false
  };


  // array of elements in, fitty instances out
  function fittyCreate(elements, options) {

    // set options object
    const fittyOptions = {

      // expand default options
      ...defaultOptions,

      // override with custom options
      ...options
    };

    // create fitties
    const publicFitties = elements.map(element => {

      // create fitty instance
      const f = {

        // expand defaults
        ...fittyOptions,

        // internal options for this fitty
        element,
        active: true
      };

      // initialise this fitty
      init(f);

      // expose API
      return {
        element,
        fit: fit(f, DrawState.DIRTY),
        unfreeze: subscribe(f),
        freeze: unsubscribe(f),
        unsubscribe: destroy(f)
      };

    });

    // call redraw on newly initiated fitties
    requestRedraw();

    // expose fitties
    return publicFitties;
  }


  // fitty creation function
  function fitty(target, options = {}) {

    // if target is a string
    return typeof target === 'string' ?

      // treat it as a querySelector
      fittyCreate( toArray( document.querySelectorAll(target) ), options) :

      // create single fitty
      fittyCreate([target], options)[0];
  }


  // handles viewport changes, redraws all fitties, but only does so after a timeout
  let resizeDebounce = null;
  const onWindowResized = () => {
    w.clearTimeout(resizeDebounce);
    resizeDebounce = w.setTimeout(
      redrawAll(DrawState.DIRTY_LAYOUT),
      fitty.observeWindowDelay
    );
  };


  // define observe window property, so when we set it to true or false events are automatically added and removed
  const events = [ 'resize', 'orientationchange' ];
  Object.defineProperty(fitty, 'observeWindow', {
    set: enabled => {
      const method = `${enabled ? 'add' : 'remove'}EventListener`;
      events.forEach(e => {
        w[method](e, onWindowResized);
      });
    }
  });


  // fitty global properties (by setting observeWindow to true the events above get added)
  fitty.observeWindow = true;
  fitty.observeWindowDelay = 100;


  // public fit all method, will force redraw no matter what
  fitty.fitAll = redrawAll(DrawState.DIRTY);


  // export our fitty function, we don't want to keep it to our selves
  return fitty;

})(typeof window === 'undefined' ? null : window);