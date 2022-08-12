# Front-End Engineer Assignment

## Developer Notes

 Code is available on [on GitHub](https://github.com/bensilverman/sliderbar) at [https://github.com/bensilverman/sliderbar](https://github.com/bensilverman/sliderbar)

I've created an ES6 module named [sliderBar](src/sliderbar.ts) in Typescript -- built using [an NPM config](package.json), transpiled using rollup. and using [LESS](src/sliderbar.less) as a CSS preprocessor. 

To install: 

```node
npm install
```

To build:

```
npm run build
```

To change-watch build in real-time:

```
npm run watch
```

The assignment demo is available at [sliderbar.html](https://github.com/bensilverman/sliderbar/blob/main/sliderbar.html). 

There a couple areas that could use improvement with more time invested -- those are noted in the `TODO` comments in the sliderbar.ts code in the [src](/src) directory.

## Example Usage
```js

// specified DOM elements in HTML, styled with custom CSS if desired
const container = document.querySelector('.container');
const track = document.querySelector('.track');
const thumb = document.querySelector('.thumb');

const sliderBar = new sliderBar({
    domElements: {
        container
        track
        thumb 
    },
    range: {
        min: 0, /* left-most numeric value */
        max: 10, /* right-most numeric value */
        step: 1 /* numeric tick interval */
    },
    value: 0, /* default value of slider */
    snap: true /* if false, slider moves in a fluid motion instead of snapped to tick */  
});


// method to set slider value 
const newValue = 4;
sliderBar.setValue(newValue);

// get current slider value
const currentValue = sliderBar.value;

```




