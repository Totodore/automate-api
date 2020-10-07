import {Router} from "express";
const router = Router();
import Logger from "../utils/Logger";
import { DiscordRequest } from "../requests/RequestsMiddleware";

router.get('/', async (req: DiscordRequest, res, next) => {
    const logger = new Logger("Oauth");
    logger.log("Oauth requested");
    //Si on a pas recu le code on redirige avec un msg d'erreur
    if (!req.query.code) {
        logger.log("Error getting oauth code");
        res.redirect("../connect?msg="+encodeURI("Whoops ! It seems like your connection to Discord is impossible!"));
        return;
    }

    //On fait la requete pour avoir le token
    const dataToSend = {
        'client_id': process.env.CLIENT_ID,
        'client_secret': process.env.CLIENT_SECRET,
        'grant_type': "authorization_code",
        'redirect_uri': process.env.OWN_ENDPOINT+"/oauth",
        'code': req.query.code,
        'scope': "identify email connections"
    };
    const resToken = await req.getDiscordToken(dataToSend);
    const resUser = await req.getUserDiscord(resToken.access_token);
    
    if (!resToken || !resUser.id) {
        res.redirect("../connect?msg="+encodeURI("Whoops ! It seems like your connection to Discord is impossible!"));
        return;
    }
    //On fait une requete pour avoir l'id de la personne discord
    req.session.userId = resUser.id;

    if (req.hasUser(resUser.id)) {
        req.session.userId = resUser.id;
        const tokenTimestamp = (await req.getUser(resUser.id)).token_timestamp;
        res.cookie("userId", resUser.id, {
            maxAge: Math.floor(Date.now()/1000)-tokenTimestamp-60*60*24, //Le cookie va expirer un jour avant l'expiration du token
            //On calcul le nombre de minute qu'il reste entre mnt et l'expiration token - 1 jours
        });
        res.redirect("../?msg="+encodeURI("Nice to see you again!"));
    } else {
        try {
            req.addUser({
                ...resToken,
                token_timestamp: resToken.expires_in + Math.floor(Date.now()/1000),
            });
        } catch (e) {
            logger.error(e);
            res.redirect("../?msg="+encodeURI("Whoops ! It seems like your connection to Discord is impossible!"));
        }
        //La personne se reconnecte
        res.cookie("userId", resUser.id, {
            maxAge: resToken.expires_in - 60*60*24 //Le cookie va expirer un jour avant l'expiration du token
        });
        res.redirect("../?msg="+encodeURI("Your account has been successfully synced!"));
    }
});

router.get("/bot", async (req: DiscordRequest, res, next) => {
    const logger = new Logger("OauthBot");
    if (!req.query.code) {
        logger.log("Error getting oauth code");
        res.redirect("../?msg="+encodeURI("Whoops ! It seems like your connection to your server is impossible!"));
        return;
    }
    if (req.query.permissions != "8") {
        res.redirect("../?msg="+encodeURI("You need to get me full powers!"));
        return;
    }
    const dataToSend = {
        'client_id': process.env.CLIENT_ID,
        'client_secret': process.env.CLIENT_SECRET,
        'grant_type': "authorization_code",
        'redirect_uri': process.env.OWN_ENDPOINT+"/oauth/bot",
        'code': req.query.code,
        'scope': "bot"
    };
    const resToken = await req.addBotDiscord(dataToSend);
    if (!resToken) {
        res.redirect("../?msg="+encodeURI("Whoops ! It seems like your connection to your server is impossible!"));
        return;
    }
    
    if (!req.hasGuild(req.query.guild_id.toString())) {
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

export default router;