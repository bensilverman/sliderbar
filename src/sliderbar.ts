type Config = {
    domElements: {
        container: HTMLElement,
        track: HTMLElement,
        thumb: HTMLElement
    }
    range: Range,
    value: number,
    snap: boolean,
    onDrag?: Function,
    onUpdated?: Function
}

type Range = {
    min: number,
    max: number,
    step: number
}

type Tick = {
    left: number,
    value: number,
    label?: HTMLElement
}

class sliderBar {

    range: Range;
    container: HTMLElement;
    track: HTMLElement;
    thumb: HTMLElement;
    ticks: Array<Tick> = [];
    value: number;
    snap: boolean;
    onDrag: Function;
    onUpdated: Function;

    constructor(config: Config) {
        const { range, domElements, domElements: { container, track, thumb }, value, snap, onDrag, onUpdated } = this.validateDefaults(config);
        
        Object.assign(this,{
            container,
            track,
            thumb,
            range,
            value,
            snap,
            onDrag,
            onUpdated
        });

        new Promise((res,rej) => {
            // setup DOM elements
            this.createTicks().adjustContainer()
            res(this);
        }).then(() => {
            // then drag events and defaults
            this.thumbEvents().snapThumb(this.value);
        }).catch((err) => {
            throw new Error(err);
        })

    }

    // define defaults and validate range values... 
    // insure steps don't exceed range & min isn't out of bounds
    validateDefaults(config) {
        const { domElements, range, value, snap, onDrag, onUpdated } = config;

        //insure DOM elements exist in config & HTML
        const domElementDefaults = {
            container: domElements?.container ?? document.querySelector('.container'),
            track: domElements?.track ?? document.querySelector('.track'),
            thumb: domElements?.thumb ?? document.querySelector('.thumb')
        };
        
        Object.entries(domElementDefaults).forEach(ele => {
            if (!ele[1]) throw new Error(`domElement for ${ele[0]} not found`);
        });

        return {
            domElements: domElementDefaults,
            range: {
                min: range?.min ?? 0,
                max: range?.max ?? 10,
                step: (range?.step && range?.step < range?.max - range?.min ? range?.step : null) ?? 1
            },
            value: (value >= range?.min ? value : null) ?? range?.min ?? 0,
            snap: snap ?? true,
            onDrag: onDrag ?? function() { return; },
            onUpdated: onUpdated ?? function() { return; }
        }
    }

    // create ticks & labels and add to DOM
    createTicks() {
        const { ticks, track, range: { min, max, step } } = this;

        const numTicks = ((max - min) / step);
        
        const trackWidth        = track.offsetWidth;
        const tickIntervalWidth = trackWidth / numTicks;

        // good ole' for-loop does the trick
        let i = 0;
        for (let value: number = min; value <= max; value += step) {
            ticks.push({
                left: tickIntervalWidth * i,
                value
            });
            i++;
        }
        
        ticks.forEach((tick,i) => {
            
            // create ticks
            const tickEle = document.createElement('div');
            tickEle.classList.add('tick');
            track.appendChild(tickEle);
            const tickLeft = tick.left - (tickEle.offsetWidth / 2);
            tickEle.style.marginLeft = `${tickLeft}px`;

            // create labels
            const labelEle = document.createElement('div');
            labelEle.classList.add('label');

            // for WCAG compliance
            labelEle.setAttribute('tabIndex','2');
            
            labelEle.innerHTML = `${tick.value}`;
            track.appendChild(labelEle);
            labelEle.style.marginLeft = `${tickLeft - (labelEle.offsetWidth / 2)}px`;
            
            // label event listeners
            ['keypress','click'].forEach(event => { 
                labelEle.addEventListener(event,() => {
                    this.setValue(tick.value);
                });
            });

            ticks[i].label = labelEle;

        });

        return this;
    }

    // add necessary widths & margins with space for thumb on edges
    adjustContainer() {
        const { container, track, thumb, snap } = this;
        
        const thumbWidth = thumb.offsetWidth;

        container.style.width = `${track.offsetWidth + thumbWidth}px`;
        track.style.marginLeft = `${thumbWidth / 2}px`;

        container.setAttribute('tabIndex','1');

        /* add smooth motion transition class if needed */
        if (!snap) thumb.classList.add('smooth');

    }

    thumbEvents() {

        const { container, track, thumb, snap, onDrag, onUpdated } = this;

        // WCAG compliance, arrow key listeners
        let containerFocus = false;
        container.addEventListener('focus',() => containerFocus = true, true);
        container.addEventListener('blur',() => containerFocus = false, true);
        window.addEventListener('keydown',(e) => {
            if (!containerFocus) return;
            switch (e.keyCode) {
                case 37:
                    this.setValue(this.value-=1);
                    break;
                case 39:
                    this.setValue(this.value+=1);
                    break;
            }
        });

        let active = false;
        
        // thumb drag handling
        let dragValue: any = null;
        const dragStart   = (e) => { 
            active = [thumb, container, track].includes(e.target) || e.target.classList.contains('tick'); 

            if (e.target == container) {
                this.setValue(this.translateXToVal(e.offsetX - thumb.offsetWidth));
            }

            if (e.target == track) {
                this.setValue(this.translateXToVal(e.offsetX));
            }
        }

        const dragEnd = (e) => { 
            
            // snap value to nearest tick 
            if (active && dragValue !== null) {
                this.setValue(dragValue);
                dragValue = null;
            }

            // restore defaults
            if (!snap) thumb.classList.add('smooth');
            active = false; 
        };

        const drag = (e) => {
            if (!active) return;
            if (!snap) thumb.classList.remove('smooth');
            
            // get thumb X pos
            const eventX = (e.type === "touchmove") ? e.touches[0].clientX : e.clientX;
            let thumbX = eventX - (thumb.offsetWidth) - container.offsetLeft;
            
            // constrain movement to track
            const thumbOffset = thumb.offsetWidth/2;
            thumbX = Math.min(Math.max(thumbX, -thumbOffset), track.offsetWidth-thumbOffset);
            
            // assign value as dragged; label highlights on drag
            // TODO: better precision by setting value when left or right of thumb hits tick boundary
            dragValue = this.translateXToVal(thumbX + (thumbOffset / 2));
            
            
            onDrag(dragValue, this);

            // move thumb on drag
            if (snap) return this.snapThumb(dragValue);
     
            thumb.style.left = `${thumbX}px`;
            this.highlightLabel(dragValue);


        };

        // assign listeners, mobile and web
        window.addEventListener("touchstart", dragStart, true);
        window.addEventListener("touchend", dragEnd, true);
        window.addEventListener("touchmove", drag, true);

        window.addEventListener("mousedown", dragStart, false);
        window.addEventListener("mouseup", dragEnd, false);
        window.addEventListener("mousemove", drag, true);

        return this;
    }

    // converts slider bar X pos to value
    translateXToVal(posX: number) {
        const { ticks, track, range: { step } } = this;

        //TODO: decimal precision calc if step is less than 1; for now, step must be whole number
        const tickIndex = Math.round(posX / (track.offsetWidth / (ticks.length - 1)));
        return this.ticks[tickIndex].value;
    }

    // moves thumb to tick notch according to sliderValue
    snapThumb(sliderValue: number) {
        const { thumb, ticks } = this;
        
        Object.assign(thumb.style, {
            left: `${this.notchedTick(sliderValue).left - (thumb.offsetWidth / 2)}px`,
            visibility: 'visible'
        });
        this.highlightLabel(sliderValue);
    }

    // returns tick based upon slider value
    notchedTick(sliderValue: number) {
        return this.ticks.filter((tick) => { return tick.value == sliderValue })[0];
    }

    // highlights active label based upon value
    highlightLabel(sliderValue: number) {
        document.querySelector('.label.active')?.classList.remove('active');
        this.notchedTick(sliderValue).label?.classList.add('active');
    }

    // can be called from elsewhere outside of class
    setValue(sliderValue: number) {
        const { range: { min, max }, onUpdated } = this;

        // constrain value to range
        this.value = Math.min(Math.max(sliderValue, min), max);
        this.snapThumb(this.value);
        onUpdated(this.value, this);
    }

}

// vanilla js script include
declare global { interface Window { sliderBar: any; } }
window.sliderBar = sliderBar || {};

export {sliderBar};

