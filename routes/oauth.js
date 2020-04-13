const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const FormData = require("form-data");
const fs = require("fs");

const CLIENT_ID = "697112502378561586";
const CLIENT_SECRET = "njBmC06amOPhzEsVN6STN9VhMFybGwe2";

router.get('/', async (req, res, next) => {
    console.log("oauth requested");
    //Si on a pas recu le code on redirige avec un msg d'erreur
    if (!req.query.code) {
        console.log("Error getting oauth code");
        res.redirect("../connect?msg="+encodeURI("Ouuups ! Il semblerait qu'il soit impossible de te connecter à Discord"));
    }
    //On fait la requete pour avoir le token
    const dataToSend = {
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'grant_type': "authorization_code",
        'redirect_uri': "http://localhost:3000/oauth",
        'code': req.query.code,
        'scope': "identify email connections"
    };
    const formData = new FormData();
    Object.entries(dataToSend).forEach(el => formData.append(el[0], el[1]));
    const reqToken = await fetch("https://discordapp.com/api/oauth2/token", {
        method: "POST",
        body: formData
    }); 
    if (reqToken.status != 200) {
        console.log(`Error : ${reqToken.status} ${reqToken.statusText}`);
        res.redirect("../connect?msg="+encodeURI("Ouuups ! Il semblerait qu'il soit impossible de te connecter à Discord"));
    }
    const resToken = JSON.parse(await reqToken.text());
    // console.log(`Token response : ${JSON.stringify(resToken)}`);
    //On fait une requete pour avoir l'id de la personne discord
    const reqUser = await fetch("https://discordapp.com/api/users/@me", {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resToken.access_token}`
        }
    });
    if (reqUser.status != 200) {
        console.log(`Error : ${reqUser.status} ${reqUser.statusText}`);
        res.redirect("../connect?msg="+encodeURI("Ouuups ! Il semblerait qu'il soit impossible de te connecter à Discord"));
    }
    const resUser = JSON.parse(await reqUser.text());
    //Si l'id existe déjà dans la bdd on affiche juste un msg de reconnexion sinon on 
    //écrit les donnée dans la db
    let userDB = JSON.parse(fs.readFileSync(__dirname+"/../data/users.json"));
    if (Object.keys(userDB).includes(resUser.id)) {
        writeSessionAndCookies(resUser.id, req, res);
        res.redirect("../?msg="+encodeURI("Super ! tu t'es reconnecté !"));
    } else {
        // console.log(`data user : ${JSON.stringify(resUser)}`);
        userDB[resUser.id] = {
            access_token: resToken.access_token,
            token_expires: resToken.expires_in,
            refresh_token: resToken.refresh_token,
            username: resUser.username,
            avatar: resUser.avatar,
        };
        const userData = {
            bot: {
                location: [],
                ponctual: [],
                freq: []
            }
        };
        fs.writeFileSync(__dirname+"/../data/users.json", JSON.stringify(userDB));
        fs.mkdirSync(__dirname+"/../data/users/"+resUser.id);
        fs.writeFileSync(__dirname+"/../data/users/"+resUser.id+"/data.json", JSON.stringify(userData));
        writeSessionAndCookies(resUser.id, req, res);
        res.redirect("../?msg="+encodeURI("Ton compte discord à été relié avec succès !"));
    }
});


function writeSessionAndCookies(id, req, res) {
    req.session.userId = id;
    res.cookie("userId", id, {
        maxAge: 60*60*24*15,
    });
}
module.exports = router;
