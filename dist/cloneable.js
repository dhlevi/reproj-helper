var cloneable = /** @class */ (function () {
    function cloneable() {
    }
    cloneable.deepCopy = function (source) {
        var _this = this;
        return Array.isArray(source)
            ? source.map(function (item) { return _this.deepCopy(item); })
            : source instanceof Date
                ? new Date(source.getTime())
                : source && typeof source === 'object'
                    ? Object.getOwnPropertyNames(source).reduce(function (o, prop) {
                        Object.defineProperty(o, prop, Object.getOwnPropertyDescriptor(source, prop));
                        o[prop] = _this.deepCopy(source[prop]);
                        return o;
                    }, Object.create(Object.getPrototypeOf(source)))
                    : source;
    };
    return cloneable;
}());
export { cloneable };
//# sourceMappingURL=cloneable.js.map