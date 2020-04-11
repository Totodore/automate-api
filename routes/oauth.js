const express = require('express');
const router = express.Router();
const https = require("https");
const fs = require('fs');

const CLIENT_ID = "697112502378561586";
const CLIENT_SECRET = "njBmC06amOPhzEsVN6STN9VhMFybGwe2";

router.get('/', function(req, res, next) {
    console.log("oauth requested");
    //Si on a pas recu le code on redirige avec un msg d'erreur
    if (!req.query.code) {
        res.redirect("../connect?msg="+encodeURI("Ouuups ! Il semblerait qu'il soit impossible de te connecter à Discord"));
        return;
    }
    //On fait la requete pour avoir le token
    const formData = JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        redirect_uri: "http://localhost/oauth",
        code: req.query.code,
        scope: ""
    });
    const query = https.request({
        hostname: "discordapp.com",
        path: "/api/oauth2/token",
        method: "POST",
        headers: { 
            'Content-Type': 'application/json',
            'Content-Length': formData.length
        }
    }, authRes => {
        authRes.on("data", data => {
            const tokenResponse = JSON.parse(data);
            console.log("auth data received");

            //On fait une requete pour avoir l'id de la personne discord
            https.get({
                hostname: "discordapp.com",
                path: "/api/users/@me",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokenResponse.access_token}`
                }
            }, userRes => {
                userRes.on("data", data => {
                    //Si l'id existe déjà dans la bdd on affiche juste un msg de reconnexion sinon on 
                    //écrit les donnée dans la db
                    const userResponse = JSON.parse(data); 
                    let userDB = JSON.parse(fs.readFileSync(__dirname+"/../data/users.json"));
                    if (Object.keys(userDB).includes(userResponse.id)) {
                        // writeSessionAndCookies(userResponse.id, req, res);
                        res.end();
                        // res.redirect("../?msg="+encodeURI("Super ! tu t'es reconnecté !"));
                    } else {
                        console.log(`data user : ${JSON.stringify(userResponse)}`);
                        userDB[userResponse.id] = {
                            access_token: tokenResponse.access_token,
                            token_expires: tokenResponse.expires_in,
                            refresh_token: tokenResponse.refresh_token,
                            username: userResponse.username,
                            avatar: userResponse.avatar,
                            schedules: {},
                        };
                        fs.writeFileSync(__dirname+"/../data/users.json",JSON.stringify(userDB));
                        console.log("db saved");
                        // writeSessionAndCookies(userResponse.id, req, res);
                        console.log("test 1");
                        res.end();
                        // res.redirect("../?msg="+encodeURI("Ton compte discord à été relié avec succès !"));
                    }
                });
            }).on("error", error => console.log(error)).on("timeout", error => console.log(error));
        });
    });
    query.on("error", (error) => {
        console.log(error);
    });
    query.write(formData);
    query.end();
});


function writeSessionAndCookies(id, req, res) {
    req.session.userId = id;
    res.cookie("userId", id, {
        maxAge: 60*60*24*15,
    });
}
module.exports = router;
