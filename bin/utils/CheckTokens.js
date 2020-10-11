"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const DBManager_1 = require("./DBManager");
const Logger_1 = require("./Logger");
/**
 * Remove users in which token timestamp expires in less than a day
 */
async function checkTokens() {
    const dbManager = new DBManager_1.default();
    await dbManager.init();
    const logger = new Logger_1.default("CheckTokens");
    const usersLength = await dbManager.User.destroy({ where: { token_timestamp: { [sequelize_1.Op.lt]: Math.floor(Date.now() / 1000) - 60 * 60 * 24 } } });
    logger.log(usersLength, "user removed");
}
exports.default = checkTokens;
