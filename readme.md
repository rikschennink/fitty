# Fitty, JavaScript text resizing

Makes text fit perfectly to its container. Ideal for flexible and responsive websites.


## Use

Download the `fitty.min.js` file from the /dist folder.
 
Include the script on your page.
```html
<div id="my-element">Hello World</div>

<script src="fitty.min.js"></script>
<script>
  fitty('#my-element');
</script>
```


## How it works

Fitty rescales the target element so it purposely overflows the parent container, it then tests the size against the available space and scales it back according to the space to overflow ratio.


## Options

You can pass two option properties.

`overflowSize`
The font size in pixels used to trigger the overflow, in this case 500 pixels.

`rescaleDelay`
The delay in milliseconds used to debounce the scale function when resizing the window.

`observeWindow`
Rescale when orientation or window size changes. Is set to false if `addEventListener` is not supported.

`observeMutations`
Rescale when element contents is altered. Is set to false when `MutationObserve` is not supported.

```javascript
// default values
fitty('#my-element', {
  overflowSize: 500,
  rescaleDelay: 100,
  observeWindow: 'addEventListener' in window,
  observeMutations: 'MutationObserver' in window
});
```

## Note

- Will not work if the element is not part of the DOM or is set to `display:none`.
- Will not work with inline elements, turn your inline elements into block level elements with `display:block`.

## License

MIT