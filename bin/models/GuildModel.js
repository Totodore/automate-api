"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuildModel = void 0;
const sequelize_1 = require("sequelize");
class GuildModel extends sequelize_1.Model {
    static factory(sequelize, options) {
        const attributes = {
            guild_owner_id: {
                type: sequelize_1.DataTypes.STRING(40),
            },
            token_expires: {
                type: sequelize_1.DataTypes.INTEGER,
            },
            token: {
                type: sequelize_1.DataTypes.STRING(40)
            },
            id: {
                type: sequelize_1.DataTypes.STRING(40),
                primaryKey: true,
                unique: true
            },
            refresh_token: {
                type: sequelize_1.DataTypes.STRING(40),
            },
            timezone: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: true,
            },
            timezone_code: {
                type: sequelize_1.DataTypes.STRING(50),
                allowNull: true,
            },
            updated_at: {
                allowNull: true,
                type: sequelize_1.DataTypes.DATE,
                defaultValue: new Date(),
            }
        };
        const Guild = sequelize.define('Guild', attributes, options);
        return Guild;
    }
}
exports.GuildModel = GuildModel;
