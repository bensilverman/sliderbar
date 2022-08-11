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
    value: 0 /* default value */
});


// method to set slider value 
const newValue = 4;
sliderBar.setValue(newValue);

// get current slider value
const currentValue = sliderBar.value;

```

## Objective
Your objective is to implement a slider bar UI, with uniform tick marks that can be selected like the example shown in the video included in this folder.  

Note: if you can't play .mov files, 
you can use this [hosted gif instead](https://github.com/ischemaview/rapid-interview/blob/master/cloud-team/front-end/ischemaview_sliderbar.gif)

Please add your code to the HTML, CSS and JavaScript files provided in this file. You can add additional files if needed.

## Timing
Most candidates spend around 4 hours in total on this assignment. Please try to return this assessment to us within a couple of days.

## Important Notes
* We will try to run your solution so it must work, must solve the problem and must not contain bugs
* Please avoid using 3rd party slider bar plugins and libraries, we want to see that you're capable of building UI components from scratch. 
* Please don't use `<input type=range>` in your solution, simply because that's too easy. We want to challenge you with this assignment.
* Code quality is important to us, so please show us that you have a good sense of style, consistency and attention to detail in your code.
* Please don't use a framework (e.g. Angular or React). Even though we use Angular heavily here, this assignment is specifically for testing your knowledge of JS, HTML and CSS fundamentals.
* Less is more - we are more impressed with simple, efficient and clean solutions than a large sprawling codebase, but do take care to handle edge cases elegantly.





