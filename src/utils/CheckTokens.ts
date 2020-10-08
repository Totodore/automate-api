import {Op} from "sequelize";
import DBManager from "./DBManager";
import Logger from "./Logger";

/**
 * Remove users in which token timestamp expires in less than a day
 */
export default async function checkTokens() {
    const dbManager = new DBManager();
    await dbManager.init();
    const logger = new Logger("CheckTokens")

    const usersLength = await dbManager.User.destroy({where: {token_timestamp: {[Op.lt]: Math.floor(Date.now()/1000) - 60*60*24}}});
    
    logger.log(usersLength, "user removed");
}