"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const Logger_1 = require("../utils/Logger");
const router = express.Router();
const ADMINISTRATOR = 0x00000008;
const MANAGE_GUILD = 0x00000020;
/* GET home page. */
router.get('/', async (req, res, next) => {
    const logger = new Logger_1.default("Index");
    const token = (await req.getUser(req.session.userId)).access_token;
    let guildRes = await req.getUserGuildsDiscord(token);
    if (!guildRes) {
        res.render('index', { header: req.headerData, error: "I didn't manage to collect all your channels, sniffu..." });
        return;
    }
    guildRes = guildRes.filter((el) => {
        if (el.permissions & ADMINISTRATOR || el.permissions & MANAGE_GUILD)
            return true;
        else
            return false;
    });
    guildRes = await Promise.all(guildRes.map(async (element) => {
        element.added = await req.hasGuild(element.id);
        return element;
    }));
    guildRes.sort((a, b) => { if (a.added)
        return -1;
    else if (b.added)
        return 1;
    else
        return 0; });
    if (guildRes.length > 0)
        res.render('index', { header: req.headerData, guilds: guildRes, bot_link: process.env.BOT_LINK });
    else
        res.render("index", { header: req.headerData, error: "It seems that there is nowhere for me to hop in... Snifffu.\n I'll be able to, if you ask for permissions to be Admin :p" });
});
exports.default = router;
