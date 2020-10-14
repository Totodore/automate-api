export default class Logger {
    constructor(
        private _name: string, 
        private _datetime: boolean = false
    ) {}

    public log(...args: any[]) {
        console.log(`[${this._name}] ${this._datetime ? this.getTime() : ""}`, ...args);
    }
    public error(...args: any[]) {
        console.error(`[${this._name}] ${this._datetime ? this.getTime() : ""}`, ...args);
    }

    protected getTime(): string {
        const date = new Date();
        return `{${date.toUTCString()}`;
    }
}