"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var sequelize_1 = require("sequelize");
var uuid_1 = require("uuid");
var MessageType;
(function (MessageType) {
    MessageType[MessageType["Frequential"] = 0] = "Frequential";
    MessageType[MessageType["Ponctual"] = 1] = "Ponctual";
})(MessageType || (MessageType = {}));
exports.MessageType = MessageType;
var MessageModel = /** @class */ (function (_super) {
    __extends(MessageModel, _super);
    function MessageModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MessageModel.factory = function (sequelize) {
        var attributes = {
            id: {
                type: sequelize_1.DataTypes.UUIDV4,
                allowNull: false,
                unique: true,
                primaryKey: true
            },
            channel_id: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            cron: {
                type: sequelize_1.DataTypes.STRING
            },
            timestamp: {
                type: sequelize_1.DataTypes.INTEGER
            },
            message: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            description: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            sys_content: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            timezone_code: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            guild_id: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            type: {
                type: sequelize_1.DataTypes.ENUM,
                allowNull: false,
                values: Object.keys(sequelize_1.DataTypes)
            }
        };
        var Message = sequelize.define('Message', attributes);
        Message.beforeCreate(function (message) { message.id = uuid_1.v4(); });
        return Message;
    };
    return MessageModel;
}(sequelize_1.Model));
exports.MessageModel = MessageModel;
