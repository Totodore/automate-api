"use strict";
exports.__esModule = true;
var Logger = /** @class */ (function () {
    function Logger(name) {
        this._name = "UndefinedClass";
        this._name = name;
    }
    Logger.prototype.log = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.log("[" + this._name + "]", args);
    };
    Logger.prototype.error = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.error("[" + this._name + "]", args);
    };
    return Logger;
}());
exports["default"] = Logger;
