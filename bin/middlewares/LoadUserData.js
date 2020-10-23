"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = require("node-fetch");
const Logger_1 = require("../utils/Logger");
async function default_1(req, res, next) {
    const logger = new Logger_1.default("GetUserInfos");
    if (req.cookies.userId) {
        const userData = await req.getUser(req.cookies.userId);
        const reqUser = await node_fetch_1.default("https://discordapp.com/api/users/@me", {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userData.access_token}`
            }
        });
        if (reqUser.status != 200) {
            logger.log(`Error : ${reqUser.status} ${reqUser.statusText}`);
            res.redirect("../connect?msg=" + encodeURI("Whoops ! It seems like your connection to Discord is impossible!"));
            return;
        }
        const resUser = JSON.parse(await reqUser.text());
        req.headerData = {
            username: resUser.username,
            avatar: `${process.env.CDN_ENDPOINT}/avatars/${req.cookies.userId}/${resUser.avatar}.png?size=64`
        };
    }
    next();
}
exports.default = default_1;
