![Fitty Logo](https://cdn.rawgit.com/rikschennink/fitty/gh-pages/fitty.svg)

# Fitty, JavaScript text resizing

Makes text fit perfectly to its container. Ideal for flexible and responsive websites.


## Use

Download the `fitty.min.js` file from the /dist folder.
 
Include the script on your page.

Call fitty like shown below and pass an element reference or a querySelector.

```html
<div id="my-element">Hello World</div>

<script src="fitty.min.js"></script>
<script>
  fitty('#my-element');
</script>
```


## How it works

Fitty calculates the size difference between the parent and child container, then it resizes the child to fit the parent.



## Arguments

You can pass the following option properties.

`minSize`
The minimum font size in pixels. Default is `16`.

`maxSize`
The maximum font size in pixels. Default is `512`. What can I say, I like powers of two.

`multiLine`
Wrap lines when using minimum font size. Default is `true`.

`observeMutations`
Rescale when element contents is altered. Is set to false when `MutationObserver` is not supported. Pass `true` to use the default [MutationObserverInit](https://developer.mozilla.org/en/docs/Web/API/MutationObserver#MutationObserverInit) configuration, pass a custom MutationObserverInit config to optimize monitoring based on your project.

Default configuration
```javascript
{
  subtree: true,
  childList: true,
  characterData: true
}
````

You can pass custom arguments like this (currently shows default values)
```javascript
fitty('#my-element', {
  minSize: 16,
  maxSize: 512,
  multiLine: true,
  observeMutations: 'MutationObserver' in window
});
```


## Options

`fitty.observeWindow`
Observe the window for resize and orientationchange events. Default is `true`.

`fitty.observeWindowDelay`
Redraw delay for when above events are triggered. Default is `100`.


## API


`fit()`
Force a redraw of the current fitty element.

`unsubscribe()`
Remove the fitty element from the redraw loop and restore it to its original state.

```javascript
var myFitty = fitty('#my-element');

// force refit
myFitty.fit();

// unsubscribe from fitty
myFitty.unsubscribe();
```


## Performance

For optimal performance add a CSS selector to your stylesheet that sets the elements that will be resized to have `white-space:nowrap` and `display:inline-block`. If not, Fitty will detect this and will have to restyle the elements itself resulting in a slight performance penalty.

Suppose all elements that you apply fitty to have the class `fit`, add this CSS selector:
```css
.fit {
    display: inline-block;
    white-space: nowrap;
}
```

Should you only want to do this when JavaScript is available, add the following to the `<head>` of your web page.

```html
<script>document.documentElement.classList.add('js');</script>
```
And change the CSS selector to:

```css
.js .fit {
    display: inline-block;
    white-space: nowrap;
}
```


## Note

Will not work if the element is not part of the DOM. 


## Tested

- Modern browsers
- IE 10+


## Versioning

Versioning follows [Semver](http://semver.org). Within 24 hours we moved to version 2.0. 

## License

MIT
