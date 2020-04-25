const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const FormData = require("form-data");
const fs = require("fs");

router.get('/', async (req, res, next) => {
    console.log("Oauth requested");
    //Si on a pas recu le code on redirige avec un msg d'erreur
    if (!req.query.code) {
        console.log("Error getting oauth code");
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
    const formData = new FormData();
    Object.entries(dataToSend).forEach(el => formData.append(el[0], el[1]));
    const reqToken = await fetch(process.env.API_ENDPOINT+"/oauth2/token", {
        method: "POST",
        body: formData
    }); 
    if (reqToken.status != 200) {
        console.log(`Error : ${reqToken.status} ${reqToken.statusText}`);
        res.redirect("../connect?msg="+encodeURI("Whoops ! It seems like your connection to Discord is impossible!"));
        return;
    }
    const resToken = JSON.parse(await reqToken.text());
    //On fait une requete pour avoir l'id de la personne discord
    const reqUser = await fetch(`${process.env.API_ENDPOINT}/users/@me`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resToken.access_token}`
        }
    });
    if (reqUser.status != 200) {
        console.log(`Error : ${reqUser.status} ${reqUser.statusText}`);
        res.redirect("../connect?msg="+encodeURI("Whoops ! It seems like your connection to Discord is impossible!"));
        return;
    }
    const resUser = JSON.parse(await reqUser.text());
    //Si l'id existe déjà dans la bdd on affiche juste un msg de reconnexion sinon on 
    //écrit les donnée dans la db
    let userDB = JSON.parse(fs.readFileSync(__dirname+"/../data/users.json"));
    if (Object.keys(userDB).includes(resUser.id)) {
        req.session.userId = resUser.id;
        res.cookie("userId", resUser.id, {
            maxAge: Math.floor(Date.now()/1000)-userDB[resUser.id].token_timestamp-60*60*24, //Le cookie va expirer un jour avant l'expiration du token
            //On calcul le nombre de minute qu'il reste entre mnt et l'expiration token - 1 jours
        });
        res.redirect("../?msg="+encodeURI("Nice to see you again!"));
        return;
    } else {
        // console.log(`data user : ${JSON.stringify(resUser)}`);
        userDB[resUser.id] = {
            access_token: resToken.access_token,
            token_timestamp: resToken.expires_in + Math.floor(Date.now()/1000),
            refresh_token: resToken.refresh_token
        };
        try {
            fs.writeFileSync(__dirname+"/../data/users.json", JSON.stringify(userDB));
        } catch (e) {
            console.error(e);
            res.redirect("../?msg="+encodeURI("Whoops ! It seems like your connection to Discord is impossible!"));
            return;
        }
        //La personne se reconnecte
        req.session.userId = resUser.id;
        res.cookie("userId", resUser.id, {
            maxAge: resToken.expires_in - 60*60*24 //Le cookie va expirer un jour avant l'expiration du token
        });
        res.redirect("../?msg="+encodeURI("Your account has been successfully synced!"));
    }
});

router.get("/bot", async (req, res, next) => {
    if (!req.query.code) {
        console.log("Error getting oauth code");
        res.redirect("../?msg="+encodeURI("Whoops ! It seems like your connection to your server is impossible!"));
        return;
    }
    if (req.query.permissions != "8") {
        res.redirect("../?msg="+encodeURI("You need to get me full powers!"));
        return;
    }
    else {
        const dataToSend = {
            'client_id': process.env.CLIENT_ID,
            'client_secret': process.env.CLIENT_SECRET,
            'grant_type': "authorization_code",
            'redirect_uri': process.env.OWN_ENDPOINT+"/oauth/bot",
            'code': req.query.code,
            'scope': "bot"
        };
        const formData = new FormData();
        Object.entries(dataToSend).forEach(el => formData.append(el[0], el[1]));
        const reqToken = await fetch(`${process.env.API_ENDPOINT}/oauth2/token`, {
            method: "POST",
            body: formData
        }); 
        if (reqToken.status != 200) {
            console.log(`Error : ${reqToken.status} ${reqToken.statusText}`);
            res.redirect("../?msg="+encodeURI("Whoops ! It seems like your connection to your server is impossible!"));
            return;
        }
        const resToken = JSON.parse(await reqToken.text());
        if (!fs.existsSync(__dirname + "/.." + process.env.DB_GUILDS + "/" + req.query.guild_id + "/data.json")) {
            fs.mkdirSync(__dirname + "/.." + process.env.DB_GUILDS + "/" + req.query.guild_id);
            fs.writeFileSync(__dirname + "/.." + process.env.DB_GUILDS + "/" + req.query.guild_id + "/data.json", JSON.stringify({
                ponctual: [],
                freq: [],
                deleted: [],
                token: resToken.access_token,
                token_expires: resToken.expires_in,
                refresh_token: resToken.refresh_token,
                guild_owner_id: resToken.guild.owner_id,
            }));
        }
        res.redirect("../dashboard/?id="+req.query.guild_id);
    }
});
module.exports = router;
