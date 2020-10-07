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
var GuildModel = /** @class */ (function (_super) {
    __extends(GuildModel, _super);
    function GuildModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GuildModel.factory = function (sequelize) {
        var attributes = {
            guild_owner_id: {
                type: sequelize_1.DataTypes.STRING
            },
            token_expires: {
                type: sequelize_1.DataTypes.INTEGER
            },
            token: {
                type: sequelize_1.DataTypes.STRING
            },
            id: {
                type: sequelize_1.DataTypes.STRING
            },
            refresh_token: {
                type: sequelize_1.DataTypes.STRING
            },
            timezone: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true
            },
            timezone_code: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true
            }
        };
        var Guild = sequelize.define('Guild', attributes);
        return Guild;
    };
    return GuildModel;
}(sequelize_1.Model));
exports.GuildModel = GuildModel;
