import {ModelCtor, Sequelize} from "sequelize";
import Logger from "./Logger";
import {GuildModel} from "../models/GuildModel";
import {UserModel} from "../models/UserModel";
import {MessageModel} from "../models/MessageModel";

export default class DBManager extends Logger {
    
    private sequelize: Sequelize;
    
    public User: ModelCtor<UserModel>;
    public Guild: ModelCtor<GuildModel>;
    public Message: ModelCtor<MessageModel>;
    
    constructor() {
        super("DBManager");
        this.sequelize = new Sequelize({
            database: "automate",
            host: process.env.DB_HOST,
            username: process.env.DB_USER,
            password: process.env.DB_PASS
        })
    }
    
    public init() {
        this.User = UserModel.factory(this.sequelize);
        this.Guild = GuildModel.factory(this.sequelize);
        this.Message = MessageModel.factory(this.sequelize);
    }
}