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
var Logger_1 = require("./Logger");
var GuildModel_1 = require("../models/GuildModel");
var UserModel_1 = require("../models/UserModel");
var MessageModel_1 = require("../models/MessageModel");
var DBManager = /** @class */ (function (_super) {
    __extends(DBManager, _super);
    function DBManager() {
        var _this = _super.call(this, "DBManager") || this;
        _this.sequelize = new sequelize_1.Sequelize({
            database: "automate",
            host: process.env.DB_HOST,
            username: process.env.DB_USER,
            password: process.env.DB_PASS
        });
        return _this;
    }
    DBManager.prototype.init = function () {
        this.User = UserModel_1["default"].factory(this.sequelize);
        this.Guild = GuildModel_1["default"].factory(this.sequelize);
        this.Message = MessageModel_1.MessageModel.factory(this.sequelize);
    };
    return DBManager;
}(Logger_1["default"]));
exports["default"] = DBManager;
