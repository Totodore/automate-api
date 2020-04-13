const express = require('express');
const fetch = require("node-fetch");
const fs = require("fs");
const router = express.Router();

const ADMINISTRATOR =	0x00000008;
const MANAGE_CHANNELS =	0x00000010;
const MANAGE_GUILD = 0x00000020;
/* GET home page. */
router.get('/', async (req, res, next) => {
  const token = JSON.parse(fs.readFileSync(__dirname+"/../data/users.json"))[req.session.userId]["access_token"];
  const guildReq = await fetch("https://discordapp.com/api/users/@me/guilds", {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (guildReq.status != 200) {
    console.log(`Erreur : ${guildReq.status} ${guildReq.statusText}`);
    res.render('index', {header: req.headerData, error: "Impossible de récupérer la liste de tes channels, sniff..."});
  }
  let guildRes = JSON.parse(await guildReq.text());
  guildRes = guildRes.filter((el) => {
    if (el.permissions & ADMINISTRATOR || el.permissions & MANAGE_CHANNELS || el.permissions & MANAGE_GUILD)
      return true;
    else return false;
  });
  if (guildRes.length > 0) 
    res.render('index', {header: req.headerData, guilds: guildRes});
  else 
    res.render("index", {header: req.headerData, error: "Il semblerait que tu n'ais aucun serveur sur lequel tu puisses installer ce bot, Snifff.\n Demande un accès administrateur à ton serveur et tu pourras :p"});
});

module.exports = router;
