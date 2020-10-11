"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = require("node-fetch");
const Logger_1 = require("../utils/Logger");
async function default_1(req, res, next) {
    const logger = new Logger_1.default("DiscordRequestMiddleware");
    req.getUserDiscord = async (token) => {
        const reqUser = await node_fetch_1.default(`${process.env.API_ENDPOINT}/users/@me`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (reqUser.status != 200) {
            logger.log(`Error : ${reqUser.status} ${reqUser.statusText}`);
            res.redirect("../connect?msg=" + encodeURI("Whoops ! It seems like your connection to Discord is impossible!"));
            return;
        }
        else
            return await reqUser.json();
    };
    req.getUserGuildsDiscord = async (token) => {
        const guildReq = await node_fetch_1.default("https://discordapp.com/api/users/@me/guilds", {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (guildReq.status != 200) {
            logger.log(`Erreur : ${guildReq.status} ${guildReq.statusText}`);
        }
        else
            return await guildReq.json();
    };
    req.getDiscordToken = async (data) => {
        const formData = new URLSearchParams();
        Object.entries(data).forEach(el => formData.append(el[0], el[1].toString()));
        const reqToken = await node_fetch_1.default(process.env.API_ENDPOINT + "/oauth2/token", {
            method: "POST",
            body: formData
        });
        if (reqToken.status != 200) {
            logger.log(`Error : ${reqToken.status} ${reqToken.statusText}`);
            if (reqToken.status == 429 || reqToken.status == 400) {
                logger.error(JSON.parse(await reqToken.text()));
                //TODO: Bot send error on discord when 429
            }
        }
        else
            return await reqToken.json();
    };
    req.addBotDiscord = async (data) => {
        const formData = new URLSearchParams();
        Object.entries(data).forEach(el => formData.append(el[0], el[1].toString()));
        const reqToken = await node_fetch_1.default(`${process.env.API_ENDPOINT}/oauth2/token`, {
            method: "POST",
            body: formData
        });
        if (reqToken.status != 200) {
            logger.log(`Error : ${reqToken.status} ${reqToken.statusText}`);
        }
        else
            return await reqToken.json();
    };
    next();
}
exports.default = default_1;
