export default class Logger {
    private _name: string = "UndefinedClass";

    constructor(name: string) {
        this._name = name;
    }

    public log(...args: any[]) {
        console.log(`[${this._name}]`, ...args);
    }
    public error(...args: any[]) {
        console.error(`[${this._name}]`, ...args);
    }
}