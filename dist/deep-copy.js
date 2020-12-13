import { __assign } from "tslib";
/**
 * Deep copy function for TypeScript.
 * @param T Generic type of target/copied value.
 * @param target Target value to be copied.
 * @see Source project, ts-deepcopy https://github.com/ykdr2017/ts-deepcopy
 * @see Code pen https://codepen.io/erikvullings/pen/ejyBYg
 */
export var deepCopy = function (target) {
    if (target === null) {
        return target;
    }
    if (target instanceof Date) {
        return new Date(target.getTime());
    }
    if (target instanceof Array) {
        var cp_1 = [];
        target.forEach(function (v) { cp_1.push(v); });
        return cp_1.map(function (n) { return deepCopy(n); });
    }
    if (typeof target === 'object' && target !== {}) {
        var cp_2 = __assign({}, target);
        Object.keys(cp_2).forEach(function (k) {
            cp_2[k] = deepCopy(cp_2[k]);
        });
        return cp_2;
    }
    return target;
};
//# sourceMappingURL=deep-copy.js.map