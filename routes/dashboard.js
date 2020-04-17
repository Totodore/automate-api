const express = require('express');
const fs = require("fs");
const fetch = require("node-fetch");
const router = express.Router();

router.get('/', async (req, res, next) => {
    const bot = req.app.get("bot");
    const db = JSON.parse(fs.readFileSync(__dirname + "/../data/guilds/" + req.query.id + "/data.json"));
    const guild_id = req.query.id;

    if (!db || !req.query.id) {
        console.log("Error loading database");
        res.redirect("../?msg=" + encodeURI("Ouuups ! Une erreur est apparue lors du chargement du dashboard. Sniff..."));
        return;
    }
    const table = db.freq.concat(db.ponctual);
    //On envoie une requête pour avoir la liste des channels
    bot.send("request_channels?id=" + guild_id);
    //On attend le retour, si c'est le bon on enlève le listener sinon on transmet le signal aux autres listeners
    const botChannelsListener = messageChannels => {
        if (messageChannels.split("\n")[0] === "response_channels?id=" + guild_id) {

            bot.off("message", botChannelsListener);

            const channelRes = JSON.parse(messageChannels.split("\n")[1]).filter((element) => {
                if (!element.deleted && (element.type == "text" || element.type == "news"))
                    return true;
                else return false;
            });

            if (!channelRes) {
                console.log(`Error loading channels data : ${channelReq.status} ${channelReq.statusText}`);
                res.redirect("../?msg=" + encodeURI("Ouuups ! Une erreur est apparue lors du chargement du dashboard. Sniff..."));
                return;
            }
            table.forEach(element => {
                channelRes.forEach((channel, index) => {
                    if (channel.id == element.channel_id)
                        element.channel_name = channelRes[index].name;
                });
            });
            console.log(channelRes);
            //On envoie une requête au bot pour avoir des infos sur la guild
            bot.send("request_guild?id="+guild_id);
            //On build le listener, si c'est la bonne réponse on l'arrête et on envoie une réponse sinon on dispatch l'event
            const botGuildListener = messageGuild => {

                if (messageGuild.split("\n")[0] === "response_guild?id="+guild_id) {

                    bot.off("message", botGuildListener);

                    const guildRes = JSON.parse(messageGuild.split("\n")[1]);
                    console.log(guildRes);
                    if (!guildRes) {
                        console.log(`Error loading channels data : ${channelReq.status} ${channelReq.statusText}`);
                        res.redirect("../?msg=" + encodeURI("Ouuups ! Une erreur est apparue lors du chargement du dashboard. Sniff..."));
                        return;
                    }
                    res.render('dashboard', {header: req.headerData, table: table, channel_list: channelRes, guild_data: guildRes, cdn: process.env.CDN_ENDPOINT});
                } else
                    bot.emit("message", messageGuild);
            };
            bot.on("message", botGuildListener);
        } else
            bot.emit("message", message);
    };
    bot.on("message", botChannelsListener);
});

module.exports = router;