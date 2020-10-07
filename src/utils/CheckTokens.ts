import * as fs from "fs";
import Logger from "./Logger";

export default async function checkTokens() {
    const logger = new Logger("CheckTokens")
    const userData = JSON.parse(fs.readFileSync(`${__dirname}/data/users.json`).toString());
    const keysToDelete = [];
    try {
        for (const key of Object.keys(userData)) {
            const value = userData[key];
            if (value.token_timestamp < Math.floor(Date.now()/1000) - 60*60*24)//si ca expire dans 1jours
                keysToDelete.push(key);
        }
        logger.log(`Checking token availability : ${keysToDelete.length} user accounts expired`);
        keysToDelete.forEach(key => delete userData[key]);
    } catch(e) {
        logger.error(`Error function refresh token : ${e}`);
        return;
    }
    fs.writeFileSync(`${__dirname}/data/users.json`, JSON.stringify(userData));
}