"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const Logger_1 = require("./Logger");
const GuildModel_1 = require("../models/GuildModel");
const UserModel_1 = require("../models/UserModel");
const MessageModel_1 = require("../models/MessageModel");
class DBManager extends Logger_1.default {
    constructor() {
        super("DBManager");
        this.sequelize = new sequelize_1.Sequelize({
            database: process.env.DB_NAME,
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT),
            username: process.env.DB_USER,
            password: process.env.DB_PASS,
            dialect: "mysql"
        });
    }
    async init(removeOld = false) {
        this.User = UserModel_1.UserModel.factory(this.sequelize, { timestamps: false });
        this.Guild = GuildModel_1.GuildModel.factory(this.sequelize, { timestamps: false });
        this.Message = MessageModel_1.MessageModel.factory(this.sequelize, { timestamps: false });
        try {
            await this.sequelize.sync({ force: removeOld });
        }
        catch (e) {
            this.log("Error syncinc model to DB", e);
        }
    }
}
exports.default = DBManager;
