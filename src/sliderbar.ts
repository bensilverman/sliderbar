type Config = {
    domElements: {
        container: HTMLElement,
        track: HTMLElement,
        thumb: HTMLElement
    }
    range: Range,
    value: number,
    snap: boolean
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

    constructor(config: Config) {
        const { range, domElements: { container, track, thumb }, value, snap } = config;
        
        Object.assign(this,{
            container,
            track,
            thumb,
            range,
            value: value ?? range.min,
            snap: snap ?? true
        });

        new Promise((res) => {
            // setup DOM elements
            this.createTicks().adjustContainer()
            res(this);
        }).then(() => {
            // then drag events and defaults
            this.thumbEvents().snapThumb(this.value);
        });

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

            // assign click events to ticks
            tickEle.addEventListener('mousedown',() => {
                this.setValue(tick.value);
            });

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

        const { container, track, thumb, snap } = this;

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
        // click on track directly
        track.addEventListener('mousedown',(e) => {
            if (e.target != e.currentTarget) return;
            active = true;
            this.setValue(this.translateXToVal(e.offsetX));
        });

        // click on container 
        container.addEventListener('mousedown',(e) => {
            if (e.target != e.currentTarget) return;
            active = true;
            this.setValue(this.translateXToVal(e.offsetX - thumb.offsetWidth));
        });

        // thumb drag handling
        let dragValue: any = null;
        const dragStart   = (e) => { active = [thumb, container, track].includes(e.target) || e.target.classList.contains('tick'); };
        const dragEnd     = (e) => { 
            
            // snap value to nearest tick 
            if (active && dragValue !== null) {
                this.setValue(dragValue);
                dragValue = null;
            }

            // restore defaults
            if (!snap) thumb.classList.add('smooth');
            active = false; 
        }

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

            // move thumb on drag

            if (snap) return this.snapThumb(dragValue);
            
            thumb.style.left = `${thumbX}px`;
            this.highlightLabel(dragValue);

        }

        // assign listeners, mobile and web
        container.addEventListener("touchstart", dragStart, true);
        container.addEventListener("touchend", dragEnd, true);
        container.addEventListener("touchmove", drag, true);

        window.addEventListener("mousedown", dragStart, false);
        [window,container].forEach(ele => { addEventListener("mouseup", dragEnd, false) });
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
        const { range: { min, max } } = this;

        // constrain value to range
        this.value = Math.min(Math.max(sliderValue, min), max);
        this.snapThumb(this.value);
    }

}

// vanilla js script include
declare global { interface Window { sliderBar: any; } }
window.sliderBar = sliderBar || {};

export {sliderBar};

