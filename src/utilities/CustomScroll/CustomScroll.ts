/*
This software uses code taken from the IScroll project which can be found at https://github.com/cubiq/iscroll

Copyright (c) 2014 Matteo Spinelli, cubiq.org

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
export class CustomScroll {

  wrapper: any;
  scroller: any;
  scrollerStyle: CSSStyleDeclaration;
  options: any;
  translateZ: string;

  x: number;
  y: number;

  moved: boolean;
  distX: number;
  distY: number;

  startTime: number;
  startX: number;
  startY: number;
  pointX: number;
  pointY: number;

  maxScrollX: number;
  maxScrollY: number;
  endTime: number;

  wrapperWidth: number;
  wrapperHeight: number;
  scrollerWidth: number;
  scrollerHeight: number;

  hasHorizontalScroll: boolean;
  hasVerticalScroll: boolean;
  isInTransition: boolean;

  syncHorizontal: Array<CustomScroll> = [];
  syncVertical: Array<CustomScroll> = [];

  constructor(el, options={}) {
    this.wrapper = document.querySelector(el);
    this.scroller = this.wrapper.children[0];
    this.scrollerStyle = this.scroller.style;

    this.options = {
      bindTo: {
        horizontal: [],
        vertical: []
      },
      momentum: true,
      scrollY: true,
      scrollX: true,
      bounce: true,
      bounceTime: 600,
      bounceEasing: 'cubic-bezier(0.2, 0.9, 0.2, 1)',
      scrollHeight: null
    }

    for (let option in options) {
      this.options[option] = options[option];
    }

    this.hasHorizontalScroll = this.options.scrollX;
    this.hasVerticalScroll = this.options.scrollY;

    this.translateZ = ' translateZ(0)';

    this.x = 0;
    this.y = 0;

    this.initEvents();
    this.refresh();
    this.translate(0, 0);
  }

  initEvents() {
    this.wrapper.addEventListener('touchstart', this);
    this.wrapper.addEventListener('touchmove', this);
    this.wrapper.addEventListener('touchcancel', this);
    this.wrapper.addEventListener('touchend', this);
    this.wrapper.addEventListener('transitionend', this);
  }

  start(ev, syncOptions=null) {
    let point = ev.touches[0];

    let doX = !syncOptions || syncOptions.doX;
    let doY = !syncOptions || syncOptions.doY;

    this.startTime = (syncOptions && syncOptions.startTime) || Date.now();
    if (!syncOptions) {
      for (let scroll of this.syncHorizontal)
        scroll.start(ev, { doX: true, doY: false, startTime: this.startTime });
      for (let scroll of this.syncVertical)
        scroll.start(ev, { doX: false, doY: true, startTime: this.startTime });
    }

    this.moved = false;
    this.distX = 0;
    this.distY = 0;

    this.startX = this.x;
    this.startY = this.y;
    this.pointX = point.pageX;
    this.pointY = point.pageY;
    let pos = this.getComputedPosition();

    this.transitionTime();
    this.isInTransition = false;
    this.translate(doX ? Math.round(pos.x) : this.x, doY ? Math.round(pos.y) : this.y);
	}

  move(ev, syncOptions=null) {
    ev.preventDefault();

    let doX = !syncOptions || syncOptions.doX;
    let doY = !syncOptions || syncOptions.doY;

    let time = (syncOptions && syncOptions.time) || Date.now();
    if (!syncOptions) {
      for (let scroll of this.syncHorizontal)
        scroll.move(ev, { doX: true, doY: false, time: time });
      for (let scroll of this.syncVertical)
        scroll.move(ev, { doX: false, doY: true, time: time });
    }

    let point = ev.touches[0];
    let deltaX = point.pageX - this.pointX;
    let deltaY = point.pageY - this.pointY;
    let newX, newY;

    this.pointX	= point.pageX;
		this.pointY	= point.pageY;

    this.distX += deltaX;
    this.distY += deltaY;

    let absDistX = Math.abs(this.distX);
    let absDistY = Math.abs(this.distY);

    deltaX = this.hasHorizontalScroll ? deltaX : 0;
		deltaY = this.hasVerticalScroll ? deltaY : 0;

    if (absDistX < 10 && absDistY < 10)
      return;

    newX = this.x + deltaX;
		newY = this.y + deltaY;

    // Slow down if outside of the boundaries
    if (this.options.bounce) {
      if (newX > 0 || newX < this.maxScrollX)
        newX = this.x + (deltaX / 4);
      if (newY > 0 || newY < this.maxScrollY)
        newY = this.y + (deltaY / 4);
    } else {
      if (newX > 0 || newX < this.maxScrollX)
        newX = newX > 0 ? 0 : this.maxScrollX;
      if (newY > 0 || newY < this.maxScrollY)
        newY = newY > 0 ? 0 : this.maxScrollY;
    }

    this.moved = true;

    this.translate(doX ? newX : this.x, doY ? newY : this.y);

    // if held down and then moved again, count as a new start
    if (time - this.startTime > 300) {
			this.startTime = time;
			this.startX = this.x;
			this.startY = this.y;
		}
  }

  end(ev, syncOptions=null) {
    ev.preventDefault();
    let point = ev.changedTouches[0];

    let doX = !syncOptions || syncOptions.doX;
    let doY = !syncOptions || syncOptions.doY;

    let newX = Math.round(this.x);
    let newY = Math.round(this.y);
    let distanceX = Math.abs(newX - this.startX);
    let distanceY = Math.abs(newY - this.startY);
    let time = (syncOptions && syncOptions.time) || 0;

    this.isInTransition = false;

    if (this.reset(this.options.bounceTime))
      return;
    if (!this.moved)
      return;

    this.endTime = (syncOptions && syncOptions.endTime) || Date.now();
    let duration = this.endTime - this.startTime;

    if (this.options.momentum && duration < 300) {
      let momentumX = this.hasHorizontalScroll ? this.calculateMomentum(this.x, this.startX, duration, this.maxScrollX, this.options.bounce ? this.wrapperWidth : 0, this.options.deceleration) : { destination: newX, duration: 0 };
      let momentumY = this.hasVerticalScroll ? this.calculateMomentum(this.y, this.startY, duration, this.maxScrollY, this.options.bounce ? this.wrapperHeight : 0, this.options.deceleration) : { destination: newY, duration: 0 };
      newX = momentumX.destination;
			newY = momentumY.destination;
      if (time === 0)
			   time = Math.max(momentumX.duration, momentumY.duration);
			this.isInTransition = true;
    }

    if (!syncOptions) {
      for (let scroll of this.syncHorizontal)
        scroll.end(ev, { doX: true, doY: false, endTime: this.endTime, time: time });
      for (let scroll of this.syncVertical)
        scroll.end(ev, { doX: false, doY: true, endTime: this.endTime, time: time });
    }

    if (newX !== this.x || newY !== this.y)
			this.scrollTo(doX ? newX : this.x, doY ? newY : this.y, time, this.options.bounceEasing);
  }

  translate(x, y) {
    this.x = x;
		this.y = y;
    this.scrollerStyle.transform = 'translate(' + x + 'px,' + y + 'px)' + this.translateZ;
    this.scroller.offsetHeight;
  }

  transitionEnd(ev) {
		if (!this.isInTransition)
			return;
		this.transitionTime();
		if (!this.reset(this.options.bounceTime)) {
			this.isInTransition = false;
		}
	}

  transitionTime(time=null) {
    let t = (time || 0) + 'ms';
    this.scrollerStyle.transitionDuration = t;
  }

  transitionTimingFunction(easing) {
    this.scrollerStyle.transitionTimingFunction = easing;
  }

  scrollTo(x, y, time, easing) {
    this.isInTransition = time > 0;
    this.transitionTime(time);
    this.transitionTimingFunction(easing);
    this.translate(x, y);
  }

  calculateMomentum(current, start, time, minDest, wrapperSize, deceleration) {
    let distance = current - start;
    let speed = Math.abs(distance) / time;
    let destination, duration;

    deceleration = deceleration === undefined ? 0.0006 : deceleration;
    destination = current + ((speed*speed) / (2*deceleration) * (distance < 0 ? -1 : 1));
		duration = speed / deceleration;

    if (destination < minDest) {
			destination = wrapperSize ? minDest - (wrapperSize / 2.5 * (speed / 8)) : minDest;
			distance = Math.abs(destination - current);
			duration = distance / speed;
		} else if ( destination > 0 ) {
			destination = wrapperSize ? wrapperSize / 2.5 * ( speed / 8 ) : 0;
			distance = Math.abs(current) + destination;
			duration = distance / speed;
		}

		return {
			destination: Math.round(destination),
			duration: duration
		};
  }

  reset(time) {
    let x = this.x;
    let y = this.y;

    if (x > 0)
      x = 0;
    if (y > 0)
      y = 0;

    if (x < this.maxScrollX)
      x = this.maxScrollX;
    if (y < this.maxScrollY)
      y = this.maxScrollY;

    if (x === this.x && y === this.y)
      return false;

    this.scrollTo(x, y, time || 0, this.options.bounceEasing);
    for (let scroll of this.syncVertical)
      scroll.scrollTo(scroll.x, y, time || 0, this.options.bounceEasing);
    for (let scroll of this.syncHorizontal)
      scroll.scrollTo(x, scroll.y, time || 0, this.options.bounceEasing);

    return true;
  }

  addVerticalSync(scroll: CustomScroll) {
    this.addSync(scroll, 'vertical');
  }

  addHorizontalSync(scroll: CustomScroll) {
    this.addSync(scroll, 'horizontal');
  }

  private addSync(scroll: CustomScroll, type: string) {
    if (type === 'horizontal')
      this.syncHorizontal.push(scroll);
    else if (type === 'vertical')
      this.syncVertical.push(scroll);
  }

  updateScrollHeight(newHeight: number) {
    this.options.scrollHeight = newHeight;
    this.refresh();
  }

  updateScrollWidth(newWidth: number) {
    this.options.scrollWidth = newWidth;
    this.refresh();
  }

  refresh() {
    this.wrapper.offsetHeight;

    this.wrapperWidth	= this.wrapper.clientWidth;
		this.wrapperHeight = this.wrapper.clientHeight;

    this.scrollerWidth = this.scroller.offsetWidth;
		this.scrollerHeight	= this.scroller.offsetHeight;

    let optionHeight = this.options.scrollHeight;
    let optionWidth = this.options.scrollWidth;

		this.maxScrollX	= (this.options.scrollWidth || this.wrapperWidth) - this.scrollerWidth;
		this.maxScrollY	= (this.options.scrollHeight || this.wrapperHeight) - this.scrollerHeight;
    if (this.maxScrollY > 0)
      this.maxScrollY = 0;
    if (this.maxScrollX > 0)
      this.maxScrollX = 0;


    if (!this.hasHorizontalScroll) {
			this.maxScrollX = 0;
			this.scrollerWidth = this.wrapperWidth;
		}

		if (!this.hasVerticalScroll) {
			this.maxScrollY = 0;
			this.scrollerHeight = this.wrapperHeight;
		}

    this.endTime = 0;

    this.reset(0);
  }

  getComputedPosition() {
    let matrix = window.getComputedStyle(this.scroller, null).transform.split(')')[0].split(', ');
    let x = +(matrix[12] || matrix[4]);
    let y = +(matrix[13] || matrix[5]);
		return { x: x, y: y };
  }

  handleEvent(ev) {
    switch(ev.type) {
      case 'touchstart':
        this.start(ev);
        break;
      case 'touchmove':
        this.move(ev);
        break;
      case 'touchend':
      case 'touchcancel':
        this.end(ev);
        break;
      case 'transitionend':
        this.transitionEnd(ev);
        break;
    }
  }

}
