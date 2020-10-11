"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageType = exports.MessageModel = void 0;
const sequelize_1 = require("sequelize");
const uuid_1 = require("uuid");
var MessageType;
(function (MessageType) {
    MessageType["Frequential"] = "Frequential";
    MessageType["Ponctual"] = "Ponctual";
})(MessageType || (MessageType = {}));
exports.MessageType = MessageType;
class MessageModel extends sequelize_1.Model {
    static factory(sequelize, options) {
        const attributes = {
            id: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: true,
                unique: true,
                primaryKey: true,
            },
            channel_id: {
                type: sequelize_1.DataTypes.STRING(40),
                allowNull: false,
            },
            cron: {
                type: sequelize_1.DataTypes.STRING(40)
            },
            timestamp: {
                type: sequelize_1.DataTypes.INTEGER
            },
            message: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: false,
            },
            description: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: false,
            },
            sys_content: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: false,
            },
            timezone_code: {
                type: sequelize_1.DataTypes.STRING(50),
                allowNull: true,
            },
            guild_id: {
                type: sequelize_1.DataTypes.STRING(40),
                allowNull: false
            },
            type: {
                type: sequelize_1.DataTypes.ENUM(...Object.values(MessageType)),
                allowNull: false,
            }
        };
        const Message = sequelize.define('Message', attributes);
        Message.beforeCreate(message => { message.id = uuid_1.v4(); });
        return Message;
    }
}
exports.MessageModel = MessageModel;
