# Fitty, Vanilla text resizing

Makes an elements text fit perfectly to its parent container. Ideal for flexible and responsive websites.

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

Fitty resizes element so it purposely overflows the parent container, it then tests the size against the available space and scales it back according to the space to overflow ratio.

## Options

You can pass two option properties.

- `overflowSize`, the font size in pixels used to trigger the overflow.
- `rescaleDelay`, the delay in milliseconds used to debounce the scale function when resizing the window.

```javascript
// default values
fitty('#my-element', {
  overflowSize: 250,
  rescaleDelay: 100
});
```

## Note

- Will not work if the element is not part of the DOM or is set to `display:none`.
- Will not work with inline elements, turn your inline elements into block level elements with `display:block`.

## License

MIT