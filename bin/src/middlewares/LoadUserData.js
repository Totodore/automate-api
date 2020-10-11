"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = require("node-fetch");
async function default_1(req, res, next) {
    if (req.session.userId) {
        const userData = await req.getUser(req.session.userId);
        const reqUser = await node_fetch_1.default("https://discordapp.com/api/users/@me", {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userData.access_token}`
            }
        });
        if (reqUser.status != 200) {
            console.log(`Error : ${reqUser.status} ${reqUser.statusText}`);
            res.redirect("../connect?msg=" + encodeURI("Whoops ! It seems like your connection to Discord is impossible!"));
            return;
        }
        const resUser = JSON.parse(await reqUser.text());
        req.headerData = {
            username: resUser.username,
            avatar: `${process.env.CDN_ENDPOINT}/avatars/${req.session.userId}/${resUser.avatar}.png?size=64`
        };
    }
    next();
}
exports.default = default_1;
