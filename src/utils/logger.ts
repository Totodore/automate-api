export default class Logger {
    private _name: string = "UndefinedClass";

    constructor(name: string) {
        this._name = name;
    }

    protected log(...args: string[]) {
        console.log(`[${this._name}]`, args);
    }
}