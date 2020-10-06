import * as mysql from "mysql";
import {Sequelize} from "sequelize";
import Logger from "./logger";

export default class DBManager extends Logger {
    
    private sequelize;
    
    constructor() {
        super("DBManager");
        this.sequelize = new Sequelize({
            database: "automate",
            host: process.env.DB_HOST,
            username: process.env.DB_USER,
            password: process.env.DB_PASS
        })
    }
    
    public async init() {
        await this.init();
    }
}