const express = require('express');
const fs = require("fs");
const Cron = require("cron-converter");
const router = express.Router();

router.get('/', async (req, res, next) => {
    const bot = req.app.get("bot");
    const db = JSON.parse(fs.readFileSync(__dirname + "/../data/guilds/" + req.query.id + "/data.json"));
    const guild_id = req.query.id;

    if (!db || !req.query.id) {
        console.error("Error loading database");
        res.redirect("../?msg=" + encodeURI("Whoops ! It seems like an error has occured during the dashboard's loading. Sniffu..."));
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
                console.error(`Error loading channels data : ${channelReq.status} ${channelReq.statusText}`);
                res.redirect("../?msg=" + encodeURI("Whoops ! It seems like an error has occured during the dashboard's loading. Sniffu..."));
                return;
            }
            table.forEach(element => {
                channelRes.forEach((channel, index) => {
                    if (channel.id == element.channel_id)
                        element.channel_name = channelRes[index].name;
                });
            });
            table.sort((a, b) => {
                let timestamp_a, timestamp_b;
                if (a.timestamp) timestamp_a = a.timestamp;
                else {
                    const cronInstance = new Cron();
                    cronInstance.fromString(a.cron);
                    const scheduler = cronInstance.schedule();
                    timestamp_a = Math.floor(scheduler.next().unix() / 60);
                }
                if (b.timestamp) timestamp_b = b.timestamp;
                else {
                    const cronInstance = new Cron();
                    cronInstance.fromString(b.cron);
                    const scheduler = cronInstance.schedule();
                    timestamp_b = Math.floor(scheduler.next().unix() / 60);
                }
                if (timestamp_a < timestamp_b)
                    return -1;
                else
                    return 1;
            });
            // console.log(channelRes);
            //On envoie une requête au bot pour avoir des infos sur la guild
            bot.send("request_guild?id=" + guild_id);
            //On build le listener, si c'est la bonne réponse on l'arrête et on envoie une réponse sinon on dispatch l'event
            const botGuildListener = messageGuild => {
                if (messageGuild.split("\n")[0] === "response_guild?id=" + guild_id) {
                    bot.off("message", botGuildListener);

                    const guildRes = JSON.parse(messageGuild.split("\n")[1]);
                    if (!guildRes) {
                        console.error(`Error loading channels data`);
                        res.redirect("../?msg=" + encodeURI("Whoops ! It seems like an error has occured during the dashboard's loading. Sniffu..."));
                        return;
                    }

                    bot.send("request_people?id="+guild_id);

                    const botPeopleListener = messagePeople => {
                        if (messagePeople.split("\n")[0] === "response_people?id="+guild_id) {
                            bot.off("message", botPeopleListener);

                            const peopleRes = JSON.parse(messagePeople.split("\n")[1]);
                            if (!peopleRes) {
                                console.error(`Error loading people data`);
                                res.redirect("../?msg=" + encodeURI("Whoops ! It seems like an error has occured during the dashboard's loading. Sniffu..."));
                                return;
                            }
                            res.render('dashboard', {
                                header: req.headerData,
                                table: table, 
                                channel_list: channelRes, 
                                people_list: peopleRes,
                                guild_data: guildRes, 
                                cdn: process.env.CDN_ENDPOINT,
                                now_hour: String(new Date().getHours())+":"+String(new Date().getMinutes()+2)
                            });
                        } else 
                            bot.emit("message", messagePeople);
                    };
                    bot.on("message", botPeopleListener);
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