"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = express_1.Router();
const Logger_1 = require("../utils/Logger");
router.get('/', async (req, res, next) => {
    const logger = new Logger_1.default("Oauth");
    logger.log("Oauth requested");
    //Si on a pas recu le code on redirige avec un msg d'erreur
    if (!req.query.code) {
        logger.log("Error getting oauth code");
        res.redirect("../connect?msg=" + encodeURI("Whoops ! It seems like your connection to Discord is impossible!"));
        return;
    }
    logger.log("code", req.query.code);
    //On fait la requete pour avoir le token
    const dataToSend = {
        'client_id': process.env.CLIENT_ID,
        'client_secret': process.env.CLIENT_SECRET,
        'grant_type': "authorization_code",
        'redirect_uri': process.env.OWN_ENDPOINT + "/oauth",
        'code': req.query.code,
        'scope': "identify email connections"
    };
    const resToken = await req.getDiscordToken(dataToSend);
    if (!resToken) {
        res.redirect("../connect?msg=" + encodeURI("Whoops ! It seems like your connection to Discord is impossible!"));
        return;
    }
    const resUser = await req.getUserDiscord(resToken.access_token);
    if (!resUser) {
        res.redirect("../connect?msg=" + encodeURI("Whoops ! It seems like your connection to Discord is impossible!"));
        return;
    }
    req.session.userId = resUser.id;
    if (await req.hasUser(resUser.id)) {
        req.session.userId = resUser.id;
        const tokenTimestamp = (await req.getUser(resUser.id)).token_timestamp;
        res.cookie("userId", resUser.id, {
            maxAge: Math.floor(Date.now() / 1000) - tokenTimestamp - 60 * 60 * 24,
        });
        res.redirect("../?msg=" + encodeURI("Nice to see you again!"));
    }
    else {
        try {
            await req.addUser({
                ...resToken,
                id: resUser.id,
                token_timestamp: resToken.expires_in + Math.floor(Date.now() / 1000),
            });
        }
        catch (e) {
            logger.error(e);
            res.redirect("../?msg=" + encodeURI("Whoops ! It seems like your connection to Discord is impossible!"));
            return;
        }
        //La personne se reconnecte
        res.cookie("userId", resUser.id, {
            maxAge: resToken.expires_in - 60 * 60 * 24 //Le cookie va expirer un jour avant l'expiration du token
        });
        res.redirect("../?msg=" + encodeURI("Your account has been successfully synced!"));
    }
});
router.get("/bot", async (req, res, next) => {
    const logger = new Logger_1.default("OauthBot");
    if (!req.query.code) {
        logger.log("Error getting oauth code");
        res.redirect("../?msg=" + encodeURI("Whoops ! It seems like your connection to your server is impossible!"));
        return;
    }
    if (req.query.permissions != "8") {
        res.redirect("../?msg=" + encodeURI("You need to get me full powers!"));
        return;
    }
    const dataToSend = {
        'client_id': process.env.CLIENT_ID,
        'client_secret': process.env.CLIENT_SECRET,
        'grant_type': "authorization_code",
        'redirect_uri': process.env.OWN_ENDPOINT + "/oauth/bot",
        'code': req.query.code,
        'scope': "bot"
    };
    const resToken = await req.addBotDiscord(dataToSend);
    if (!resToken) {
        res.redirect("../?msg=" + encodeURI("Whoops ! It seems like your connection to your server is impossible!"));
        return;
    }
    if (!await req.hasGuild(req.query.guild_id.toString())) {
        await req.addGuild({
            token: resToken.access_token,
            token_expires: resToken.expires_in,
            refresh_token: resToken.refresh_token,
            guild_owner_id: resToken.guild.owner_id,
            id: req.query.guild_id.toString()
        });
    }
    res.redirect(`/dashboard/?id=${req.query.guild_id}`);
});
/**
 * If the client browser has a token,
 * it can reset it. If the token is expired we reset it
 */
router.get("/hasToken", async (req, res) => {
    if (!req.query.id) {
        res.sendStatus(400);
        return;
    }
    const user = await req.getUser(req.query.id.toString());
    if (!user) {
        res.sendStatus(301);
        return;
    }
    if (user.token_timestamp - 1000 * 60 * 60 > Date.now()) {
        //TODO: reset token
    }
    req.session.userId = req.query.id.toString();
    res.sendStatus(200);
});
exports.default = router;
