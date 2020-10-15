import Logger from "./Logger";
import * as fs from "fs/promises";
import {existsSync} from "fs";
import {join} from "path";

export default class FileLogger extends Logger {
    
    private _logFile: fs.FileHandle;

    public async init() {
        const folderPath = join(process.cwd(), "logs");
        if (!existsSync(folderPath)) {
            await fs.mkdir(folderPath);
        }
        this._logFile = await fs.open(join(folderPath, `${this._name}.log`), "w");
    }

    public log(...args: any[]) {
        super.log(...args);
        this.logFile(LogType.Log, ...args);
    }

    public error(...args: any[]) {
        super.log(...args);
        this.logFile(LogType.Error, ...args);
    }

    private logFile(type: LogType, ...args: any[]) {
        try {
            const lines = args.join(" ").split("\n");
            for (const line of lines)
                this._logFile.write(`\r\n${type} ${this.getTime()} ${line}`, );
        } catch(e) {
            this.log("Error Writing logs");
        }
    }
}
enum LogType {
    Error = "ERR",
    Log = "LOG",
}