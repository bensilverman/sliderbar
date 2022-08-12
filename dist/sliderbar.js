/** @license: MIT 
 Slider Bar Demo v1.0.0 | Copyright (c) 2022 | Ben Silverman | https://github.com/bensilverman/silderbar 
**/
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.sliderbar = {}));
})(this, (function (exports) { 'use strict';

    class sliderBar {
        constructor(config) {
            this.ticks = [];
            const { range, domElements: { container, track, thumb }, value, snap } = config;
            Object.assign(this, {
                container,
                track,
                thumb,
                range,
                value: value ?? range.min,
                snap: snap ?? true
            });
            new Promise((res) => {
                this.createTicks().adjustContainer();
                res(this);
            }).then(() => {
                this.thumbEvents().snapThumb(this.value);
            });
        }
        createTicks() {
            const { ticks, track, range: { min, max, step } } = this;
            const numTicks = ((max - min) / step);
            const trackWidth = track.offsetWidth;
            const tickIntervalWidth = trackWidth / numTicks;
            let i = 0;
            for (let value = min; value <= max; value += step) {
                ticks.push({
                    left: tickIntervalWidth * i,
                    value
                });
                i++;
            }
            ticks.forEach((tick, i) => {
                const tickEle = document.createElement('div');
                tickEle.classList.add('tick');
                track.appendChild(tickEle);
                const tickLeft = tick.left - (tickEle.offsetWidth / 2);
                tickEle.style.marginLeft = `${tickLeft}px`;
                tickEle.addEventListener('mousedown', () => {
                    this.setValue(tick.value);
                });
                const labelEle = document.createElement('div');
                labelEle.classList.add('label');
                labelEle.setAttribute('tabIndex', '2');
                labelEle.innerHTML = `${tick.value}`;
                track.appendChild(labelEle);
                labelEle.style.marginLeft = `${tickLeft - (labelEle.offsetWidth / 2)}px`;
                ['keypress', 'click'].forEach(event => {
                    labelEle.addEventListener(event, () => {
                        this.setValue(tick.value);
                    });
                });
                ticks[i].label = labelEle;
            });
            return this;
        }
        adjustContainer() {
            const { container, track, thumb, snap } = this;
            const thumbWidth = thumb.offsetWidth;
            container.style.width = `${track.offsetWidth + thumbWidth}px`;
            track.style.marginLeft = `${thumbWidth / 2}px`;
            container.setAttribute('tabIndex', '1');
            if (!snap)
                thumb.classList.add('smooth');
        }
        thumbEvents() {
            const { container, track, thumb, snap } = this;
            let containerFocus = false;
            container.addEventListener('focus', () => containerFocus = true, true);
            container.addEventListener('blur', () => containerFocus = false, true);
            window.addEventListener('keydown', (e) => {
                if (!containerFocus)
                    return;
                switch (e.keyCode) {
                    case 37:
                        this.setValue(this.value -= 1);
                        break;
                    case 39:
                        this.setValue(this.value += 1);
                        break;
                }
            });
            let active = false;
            let dragValue = null;
            const dragStart = (e) => {
                active = [thumb, container, track].includes(e.target) || e.target.classList.contains('tick');
                if (e.target == container) {
                    this.setValue(this.translateXToVal(e.offsetX - thumb.offsetWidth));
                }
                if (e.target == track) {
                    this.setValue(this.translateXToVal(e.offsetX));
                }
            };
            const dragEnd = (e) => {
                if (active && dragValue !== null) {
                    this.setValue(dragValue);
                    dragValue = null;
                }
                if (!snap)
                    thumb.classList.add('smooth');
                active = false;
            };
            const drag = (e) => {
                if (!active)
                    return;
                if (!snap)
                    thumb.classList.remove('smooth');
                const eventX = (e.type === "touchmove") ? e.touches[0].clientX : e.clientX;
                let thumbX = eventX - (thumb.offsetWidth) - container.offsetLeft;
                const thumbOffset = thumb.offsetWidth / 2;
                thumbX = Math.min(Math.max(thumbX, -thumbOffset), track.offsetWidth - thumbOffset);
                dragValue = this.translateXToVal(thumbX + (thumbOffset / 2));
                if (snap)
                    return this.snapThumb(dragValue);
                thumb.style.left = `${thumbX}px`;
                this.highlightLabel(dragValue);
            };
            window.addEventListener("touchstart", dragStart, true);
            window.addEventListener("touchend", dragEnd, true);
            window.addEventListener("touchmove", drag, true);
            window.addEventListener("mousedown", dragStart, false);
            window.addEventListener("mouseup", dragEnd, false);
            window.addEventListener("mousemove", drag, true);
            return this;
        }
        translateXToVal(posX) {
            const { ticks, track, range: { step } } = this;
            const tickIndex = Math.round(posX / (track.offsetWidth / (ticks.length - 1)));
            return this.ticks[tickIndex].value;
        }
        snapThumb(sliderValue) {
            const { thumb, ticks } = this;
            Object.assign(thumb.style, {
                left: `${this.notchedTick(sliderValue).left - (thumb.offsetWidth / 2)}px`,
                visibility: 'visible'
            });
            this.highlightLabel(sliderValue);
        }
        notchedTick(sliderValue) {
            return this.ticks.filter((tick) => { return tick.value == sliderValue; })[0];
        }
        highlightLabel(sliderValue) {
            document.querySelector('.label.active')?.classList.remove('active');
            this.notchedTick(sliderValue).label?.classList.add('active');
        }
        setValue(sliderValue) {
            const { range: { min, max } } = this;
            this.value = Math.min(Math.max(sliderValue, min), max);
            this.snapThumb(this.value);
        }
    }
    window.sliderBar = sliderBar || {};

    exports.sliderBar = sliderBar;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
