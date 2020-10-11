"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Logger {
    constructor(name) {
        this._name = "UndefinedClass";
        this._name = name;
    }
    log(...args) {
        console.log(`[${this._name}]`, ...args);
    }
    error(...args) {
        console.error(`[${this._name}]`, ...args);
    }
}
exports.default = Logger;
