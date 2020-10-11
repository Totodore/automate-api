"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const sequelize_1 = require("sequelize");
const sequelize_2 = require("sequelize");
class UserModel extends sequelize_1.Model {
    static factory(sequelize, options) {
        const attributes = {
            access_token: {
                type: sequelize_2.DataTypes.STRING(40),
                allowNull: false,
                unique: true,
            },
            id: {
                type: sequelize_2.DataTypes.STRING(40),
                allowNull: false,
                unique: true,
                primaryKey: true
            },
            token_timestamp: {
                type: sequelize_2.DataTypes.INTEGER,
                allowNull: false,
            },
            refresh_token: {
                type: sequelize_2.DataTypes.STRING(40),
                allowNull: false
            }
        };
        const User = sequelize.define('User', attributes, options);
        return User;
    }
}
exports.UserModel = UserModel;
