import {Sequelize} from "sequelize";
import Logger from "./logger";
import GuildModel from "../models/GuildModel";
import UserModel from "../models/UserModel";
import MessageModel from "../models/MessageModel";

export default class DBManager extends Logger {
    
    private sequelize: Sequelize;
    
    public user: UserModel;
    public guild: GuildModel;
    public Message: MessageModel;
    
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
        await this.sequelize.sync();
    }
}