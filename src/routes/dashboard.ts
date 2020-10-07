import {Router} from "express"
import * as Cron from "cron-converter";
import * as momentTz from "moment-timezone";
import { SessionRequest } from "../requests/RequestsMiddleware";
import Bot from "../Bot";
import Logger from "../utils/Logger";
import { Collection, Guild, GuildChannel, Role, TextChannel, GuildMember } from "discord.js";
import { MessageResponseModel } from "src/models/MessageModel";
import {GuildDataModel} from "../models/GuildModel";

const router = Router();

router.get('/', async (req: SessionRequest, res, next) => {
    const logger = new Logger("Dashboard");
    const guild_id: string = req.query.id.toString();
    const guildDB: GuildDataModel = (await req.dbManager.Guild.findOne({where: {id: guild_id}})).get(); 
    let table: MessageResponseModel[] = [];

    //On récupère le informations sur les gens, les channels, les roles et du serveur 
    let guildRes: Guild;
    let peopleRes: Collection<string, GuildMember>;
    let channelRes: Collection<string, GuildChannel>;
    let rolesRes: Collection<string, Role>;

    try {
        table = (await req.dbManager.Message.findAll({where: {guild_id: req.query.id}}));
        const bot: Bot = req.app.get("bot");

        guildRes = bot.getGuild(guild_id);
        peopleRes = bot.getPeople(guild_id);
        channelRes = bot.getChannels(guild_id);
        rolesRes = bot.getRoles(guild_id);
    } catch(e) {
        logger.log(`Error loading datas : ${e}`);
        res.redirect("../?msg=" + encodeURI("Whoops ! It seems like an error has occured during the dashboard's loading. Sniffu..."));
        return;
    }
    //On donne un nom aux channels dans lesquels il y a des messages prévus
    table.forEach(element => {
        channelRes.forEach((channel: TextChannel) => {
            if (channel.id == element.channel_id)
                element.channel_name = channel.name;
        });
    });
    //Sort message in the chronologic way
    table.sort((a, b) => {
        let timestamp_a: number, timestamp_b: number;
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
    const zones = {};
    for (const el of momentTz.tz.names()) {
        const zoneEl = momentTz.tz.zone(el);
        const offset = zoneEl.utcOffset(new Date().getTime());
        const zoneName = zoneEl.name.split("/");
        let name = `${zoneName[zoneName.length-2] || ""} : ${zoneName[zoneName.length-1]} → UTC${Math.floor(offset/60) > 0 ? "+" : ""}${Math.floor(offset/60)}`;

        zones[name] = offset;
    }

    const peopleData = peopleRes.map((val, index) => {
        return {
            username: val.user.username,
            id: val.user.id,
            nickname: val.nickname
        };
    });
    //We remove the @ if they start by a @ because they are manually added later in the html
    const rolesData = rolesRes.map((val, index) => {
        if (val.name[0] == "@")
            val.name = val.name.substring(1, val.name.length);
        return {
            username: val.name,
            id: val.id
        };
    }).filter((el, index) => el.username != "everyone");   //We remove everyone role because it is already manually added in the html
    const channelData = channelRes.map((val, index) => {
        return {
            name: val.name,
            id: val.id
        };
    });

    res.render('dashboard', {
        header: req.headerData,
        table: table, 
        channel_list: channelData, 
        people_list: peopleData,
        roles_list: rolesData,
        guild_data: guildRes, 
        cdn: process.env.CDN_ENDPOINT,
        now_hour: String(new Date().getHours())+":"+String(new Date().getMinutes()+2),
        timezone_data: zones,
        guildTimezone: guildDB.timezone
    });
});

export default router;
