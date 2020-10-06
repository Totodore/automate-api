import {Router} from "express"
import * as fs from "fs";
import * as Cron from "cron-converter";
import * as momentTz from "moment-timezone";
import SessionRequest from "../requests/SessionRequest";
const router = Router();

router.get('/', async (req: SessionRequest, res, next) => {
    let db, table;
    const guild_id = req.query.id;
    //On envoie une requête pour avoir la liste des channels
    let guildRes;
    let peopleRes;
    let channelRes;
    let rolesRes;
    try {
        db = JSON.parse(fs.readFileSync(__dirname + "/../data/guilds/" + req.query.id + "/data.json").toString());
        table = db.freq.concat(db.ponctual);

        const bot = req.app.get("bot");
        guildRes = bot.getGuild(guild_id);
        peopleRes = bot.getPeople(guild_id);
        channelRes = bot.getChannels(guild_id).filter((element) => {
            if (!element.deleted && (element.type == "text" || element.type == "news"))
                return true;
            else return false;
        });
        rolesRes = bot.getRoles(guild_id);
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
    //We get all the available zones
    let zones = {};
    for (const el of momentTz.tz.names()) {
        const zoneEl = momentTz.tz.zone(el);
        const offset = zoneEl.utcOffset(new Date().getTime());
        const zoneName = zoneEl.name.split("/");
        let name = `${zoneName[zoneName.length-2] || ""} : ${zoneName[zoneName.length-1]} → UTC${Math.floor(offset/60) > 0 ? "+" : ""}${Math.floor(offset/60)}`;

        zones[name] = offset;
    }

    peopleRes = peopleRes.map((val, index) => {
        return {
            username: val.user.username,
            id: val.user.id,
            nickname: val.nickname
        };
    });
    //We remove the @ if they start by a @ because they are manually added later in the html
    rolesRes = rolesRes.map((val, index) => {
        if (val.name[0] == "@")
            val.name = val.name.substring(1, val.name.length);
        return {
            username: val.name,
            id: val.id
        };
    }).filter((el, index) => el.username != "everyone");   //We remove everyone role because it is already manually added in the html
    channelRes = channelRes.map((val, index) => {
        return {
            name: val.name,
            id: val.id
        };
    });
    res.render('dashboard', {
        header: req.headerData,
        table: table, 
        channel_list: channelRes, 
        people_list: peopleRes,
        roles_list: rolesRes,
        guild_data: guildRes, 
        cdn: process.env.CDN_ENDPOINT,
        now_hour: String(new Date().getHours())+":"+String(new Date().getMinutes()+2),
        timezone_data: zones,
        guildTimezone: db.timezone
    });
});

export default router;
