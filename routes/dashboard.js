const express = require('express');
const fs = require("fs");
const Cron = require("cron-converter");
const router = express.Router();

router.get('/', async (req, res, next) => {
    let db, table;
    const guild_id = req.query.id;
    //On envoie une requête pour avoir la liste des channels
    let guildRes;
    let peopleRes;
    let channelRes;
    try {
        db = JSON.parse(fs.readFileSync(__dirname + "/../data/guilds/" + req.query.id + "/data.json"));
        table = db.freq.concat(db.ponctual);

        const bot = req.app.get("bot");
        guildRes = bot.getGuild(guild_id);
        peopleRes = bot.getPeople(guild_id);
        channelRes = bot.getChannels(guild_id).filter((element) => {
            if (!element.deleted && (element.type == "text" || element.type == "news"))
                return true;
            else return false;
        });
    } catch(e) {
        console.log(`Error loading datas : ${e}`);
        res.redirect("../?msg=" + encodeURI("Whoops ! It seems like an error has occured during the dashboard's loading. Sniffu..."));
        return;
    }
    table.forEach(element => {
        channelRes.forEach((channel, index) => {
            if (channel.id == element.channel_id)
                element.channel_name = channel.name;
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
    res.render('dashboard', {
        header: req.headerData,
        table: table, 
        channel_list: channelRes, 
        people_list: peopleRes,
        guild_data: guildRes, 
        cdn: process.env.CDN_ENDPOINT,
        now_hour: String(new Date().getHours())+":"+String(new Date().getMinutes()+2)
    });
});

module.exports = router;