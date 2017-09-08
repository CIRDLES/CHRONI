var _this = this;
function CustomScroll(el, options) {
    if (options === void 0) { options = {}; }
    this.wrapper = document.querySelector(el);
    this.scroller = this.wrapper.children[0];
    this.scrollerStyle = this.scroller.style;
    this.options = {
        bindTo: {
            horizontal: [],
            vertical: []
        },
        scrollY: true,
        hasVerticalScroll: true,
        hasHorizontalScroll: false
    };
    for (var option in options) {
        if (option === 'bindTo') {
            var horizontal = options[option].horizontal;
            var vertical = options[option].vertical;
            if (horizontal) {
                for (var _i = 0, horizontal_1 = horizontal; _i < horizontal_1.length; _i++) {
                    var e = horizontal_1[_i];
                    this.options.bindTo.horizontal.push(document.querySelector(e));
                }
            }
            if (vertical) {
                for (var _a = 0, vertical_1 = vertical; _a < vertical_1.length; _a++) {
                    var e = vertical_1[_a];
                    this.options.bindTo.vertical.push(document.querySelector(e));
                }
            }
        }
        else {
            this.options[option] = options[option];
        }
    }
    this.translateZ = ' translateZ(0)';
    this.x = 0;
    this.y = 0;
    this.directionX = 0;
    this.directionY = 0;
    this.events = {};
    console.log(this.wrapper.clientHeight);
    this._init();
    this.refresh();
}
CustomScroll.prototype = {
    _init: function () {
        _this._initEvents();
    },
    _initEvents: function () {
        console.log(_this.wrapper.clientHeight);
        _this.wrapper.addEventListener('touchstart', _this);
        _this.wrapper.addEventListener('touchmove', _this);
        _this.wrapper.addEventListener('touchcancel', _this);
        _this.wrapper.addEventListener('touchend', _this);
    },
    start: function (ev) {
        if (_this.typeStarted && ev.type !== _this.typeStarted)
            return;
        var point = ev.touches[0];
        var pos;
        _this.typeStarted = ev.type;
        _this.moved = false;
        _this.distX = 0;
        _this.distY = 0;
        _this.directionX = 0;
        _this.directionY = 0;
        _this.startTime = Date.now();
        _this.startX = _this.x;
        _this.startY = _this.y;
        _this.pointX = point.pageX;
        _this.pointY = point.pageY;
    },
    move: function (ev) {
        ev.preventDefault();
        var point = ev.touches[0];
        var deltaX = point.pageX - _this.pointX;
        var deltaY = point.pageY - _this.pointY;
        var time = Date.now();
        var newX, newY;
        _this.pointX = point.pageX;
        _this.pointY = point.pageY;
        _this.distX += deltaX;
        _this.distY += deltaY;
        var absDistX = Math.abs(_this.distX);
        var absDistY = Math.abs(_this.distY);
        deltaX = _this.hasHorizontalScroll ? deltaX : 0;
        deltaY = _this.hasVerticalScroll ? deltaY : 0;
        if (absDistX < 10 && absDistY < 10)
            return;
        newX = _this.x + deltaX;
        newY = _this.y + deltaY;
        // Slow down if outside of the boundaries
        if (newX > 0 || newX < _this.maxScrollX)
            newX = newX > 0 ? 0 : _this.maxScrollX;
        if (newY > 0 || newY < _this.maxScrollY)
            newY = newY > 0 ? 0 : _this.maxScrollY;
        _this.directionX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
        _this.directionY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;
        _this.moved = true;
        _this.translate(newX, newY);
        if (time - _this.startTime > 300) {
            _this.startTime = time;
            _this.startX = _this.x;
            _this.startY = _this.y;
        }
    },
    end: function (ev) {
        if (_this.typeStarted && ev.type !== _this.typeStarted)
            return;
        ev.preventDefault();
        var point = ev.changedTouches[0];
        var newX = Math.round(_this.x);
        var newY = Math.round(_this.y);
        var distanceX = Math.abs(newX - _this.startX);
        var distanceY = Math.abs(newY - _this.startY);
        var time = 0;
        _this.typeStarted = null;
        _this.endTime = Date.now();
    },
    translate: function (x, y) {
        _this.scrollerStyle.transform = 'translate(' + x + 'px,' + y + 'px)' + _this.translateZ;
        _this.x = x;
        _this.y = y;
    },
    refresh: function () {
        var rf = _this.wrapper.offsetHeight;
        _this.wrapperWidth = _this.wrapper.clientWidth;
        _this.wrapperHeight = _this.wrapper.clientHeight;
        _this.scrollerWidth = _this.scroller.offsetWidth;
        _this.scrollerHeight = _this.scroller.offsetHeight;
        _this.maxScrollX = _this.wrapperWidth - _this.scrollerWidth;
        _this.maxScrollY = _this.wrapperHeight - _this.scrollerHeight;
        if (!_this.hasHorizontalScroll) {
            _this.maxScrollX = 0;
            _this.scrollerWidth = _this.wrapperWidth;
        }
        if (!_this.hasVerticalScroll) {
            _this.maxScrollY = 0;
            _this.scrollerHeight = _this.wrapperHeight;
        }
        _this.endTime = 0;
        _this.directionX = 0;
        _this.directionY = 0;
    },
    resetPosition: function () { },
    handleEvent: function (ev) {
        switch (ev.type) {
            case 'touchstart':
                _this.start();
                break;
            case 'touchmove':
                _this.move();
                break;
            case 'touchend':
                _this.end();
                break;
        }
    }
};
// module.exports = CustomScroll;
