const express = require('express');
const router = express.Router();
const https = require("http");
const fs = require('fs');

const CLIENT_ID = "697112502378561586";
const CLIENT_SECRET = "njBmC06amOPhzEsVN6STN9VhMFybGwe2";

router.get('/', function(req, res, next) {
//   res.render('connect');
    //Si on a pas recu le code on redirige avec un msg d'erreur
    if (!req.query.code) {
        res.render("connect", {error: "Ouuups ! Il semblerait qu'il soit impossible de te connecter à Discord"});
        return;
    }
    //On fait la requete pour avoir le token
    const formData = JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        redirect_uri: "http://localhost:3000/oauth",
        code: req.query.code,
        scope: ""
    });
    const query = https.request({
        servername: "https://discordapp.com",
        pathname: "/api/oauth2/token",
        method: "POST",
        headers: { 
            'Content-Type': 'application/json',
            'Content-Length': formData.length
        }
    }, authRes => {
        authRes.on("data", data => {
            const tokenResponse = JSON.parse(data);
            //On fait une requete pour avoir l'id de la personne discord
            https.get("/users/@me", {
                auth: tokenResponse.access_token,
            }, userRes => {
                userRes.on("data", data => {
                    //Si l'id existe déjà dans la bdd on affiche juste un msg de reconnexion sinon on 
                    //écrit les donnée dans db
                    const userResponse = JSON.parse(data); 
                    let userDB = JSON.parse(fs.readFileSync("/data/users.json"));
                    if (userDB.includes(userResponse.id)) {
                        writeSessionAndCookies(userResponse.id, req, res);
                        res.render("index", {msg: "Super ! tu t'es reconnecté !"});
                    } else {
                        userDB[userResponse.id] = {
                            access_token: tokenResponse.access_token,
                            token_expires: tokenResponse.expires_in,
                            refresh_token: tokenResponse.refresh_token,
                            username: userResponse.username,
                            avatar: userResponse.avatar,
                            schedules: {},
                        };
                        fs.writeFileSync(userDB);
                        console.log("db saved");
                        writeSessionAndCookies(userResponse.id, req, res);
                        console.log("test 1");
                        res.render("index", {msg: "Ton compte discord à été relié avec succès !"});
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
