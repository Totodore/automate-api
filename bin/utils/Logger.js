"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Logger {
    constructor(_name, _datetime = false) {
        this._name = _name;
        this._datetime = _datetime;
    }
    log(...args) {
        console.log(`[${this._name}] ${this._datetime && this.getTime()}`, ...args);
    }
    error(...args) {
        console.error(`[${this._name}] ${this._datetime && this.getTime()}`, ...args);
    }
    getTime() {
        const date = new Date();
        return `{${date.toUTCString()}}`;
    }
}
exports.default = Logger;
