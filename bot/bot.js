const Discord = require('discord.js');
const dotenv = require("dotenv");
const Cron = require("cron-converter");
const fs = require("fs");
const bot = new Discord.Client();

dotenv.config();

bot.login(process.env.TOKEN_BOT);

process.on("message", message => {
    console.log(`Message from server : ${message}`);
    const params = new URLSearchParams(message.split("?")[1]);
    const url = message.split("?")[0];
    if (url == "request_channels" && params.get("id")) {
        try {
            const dataToSend = bot.guilds.cache.get(params.get("id")).channels.cache;
            process.send("response_channels?id="+params.get("id")+"\n"+JSON.stringify(dataToSend));
        } catch (error) {
            console.log("Error bot : " + error);
            process.send("response_channels?id="+params.get("id")+"\n ");
        }
    }
    else if (url == "request_guild" && params.get("id")) {
        try {
            const dataToSend = bot.guilds.cache.get(params.get("id"));
            process.send("response_guild?id="+params.get("id")+"\n"+JSON.stringify(dataToSend));
        } catch (error) {
            console.log("Error bot : " + error);
            process.send("response_guild?id="+params.get("id")+"\n ");
        }
    } else {
        console.log(`Error parsing message : ${message}`);
    }
});

bot.on('ready', () => {
    if (process.send) { 
        process.send("started");
    }
    else {
        fs.writeFileSync("bot.log", "Error pipe between server and bot");
    }
    console.info(`Logged in as ${bot.user.tag}!`);
    cronWatcher();
    bot.setInterval(cronWatcher, 1000*60);
});

bot.on("guildDelete", guild => {
    fs.rmdirSync(__dirname + "/.." + process.env.DB_GUILDS + "/" + guild.id + "/", {recursive: true});
});

function cronWatcher() {
    fs.readdirSync(__dirname + "/.." + process.env.DB_GUILDS + "/").forEach(guildId => {
        //Pour chaque guild on regarde si on doit envoyer un message
        const guildData = JSON.parse(fs.readFileSync(__dirname + "/.." + process.env.DB_GUILDS + "/" + guildId + "/data.json"));
        const timestamp = Math.floor((Date.now()/1000)/60)+1;
        
        guildData.ponctual.forEach(ponctualEvent => {
            if (ponctualEvent.timestamp == timestamp) {
                bot.channels.cache.get(ponctualEvent.channel_id).send(ponctualEvent.message);
                console.log(`New punctual message sent`);
            }
        });
        guildData.freq.forEach(freqEvent => {
            const cronInstance = new Cron();
            cronInstance.fromString(freqEvent.cron);
            const scheduler = cronInstance.schedule();
            const timestampToExec = Math.floor(scheduler.next().unix()/60);
            // console.log(`freq next  : ${timestampToExec}`);
            // console.log(`Actual : ${timestamp}`);

            if (timestampToExec == timestamp) {
                bot.channels.cache.get(freqEvent.channel_id).send(freqEvent.message);
                console.log(`New frequential message sent to ${bot.channels.cache.get(freqEvent.channel_id).name} in ${bot.channels.cache.get(freqEvent.channel_id).guild.name}`);
            }
        });
    });
}