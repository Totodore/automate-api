export default class Logger {
    private _name: string = "UndefinedClass";

    constructor(name: string) {
        this._name = name;
    }

    public log(...args: string[]) {
        console.log(`[${this._name}]`, args);
    }
    public error(...args: string[]) {
        console.error(`[${this._name}]`, args);
    }
}