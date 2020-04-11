const express = require('express');
const router = express.Router();

const OAUTH_LINK_DEV = "https://discordapp.com/api/oauth2/authorize?client_id=697112502378561586&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Foauth&response_type=code&scope=identify%20guilds";
const OAUTH_LINK = "https://discordapp.com/api/oauth2/authorize?client_id=697112502378561586&redirect_uri=http%3A%2F%2Flocalhost%2Foauth&response_type=code&scope=identify%20guilds";
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('connect', {oauth_link: OAUTH_LINK_DEV});
});

module.exports = router;
