const Discord = require('discord.js');
const dotenv = require("dotenv");
const Cron = require("cron-converter");
const fs = require("fs");
const bot = new Discord.Client();
let messageSentAverage = 0;

const STAT_CHANNEL = "702970284034097192";

dotenv.config();

class Bot {
    constructor() {
        bot.login(process.env.TOKEN_BOT);
        bot.on("ready", () => this.ready(this));
        bot.on("guildCreate", this.guildDelete);
        bot.on("guildDelete", this.guildDelete);
        bot.setInterval(this.sendStats, 1000*60*60); //Stats toutes les 3h
    }

    ready(self) {
        console.info(`Logged in as ${bot.user.tag} !\n`);
        //On attend le passage à la prochaine minute pour être le plus syncro possible
        const oldMinute = Math.floor((new Date().getTime()/1000)/60)*60;
        console.log(`Actual minute : ${new Date().getMinutes()}`);
        console.log("Waiting for new minute to start cron watcher");
        const intervalId = setInterval((self) => {
            if (Math.floor((new Date().getTime()/1000)/60)*60 > oldMinute) {
                console.log(`\n\nNew minute detected, Starting cron Watcher at minute ${new Date().getMinutes()}`);
                bot.setInterval(() => self.cronWatcher(self), 1000*60);  //Si on est passé à une nouvelle minute on lance le cronWatcher
                clearInterval(intervalId);
            }
        }, 10, self);
    }
    guildDelete(guild) {
        fs.rmdirSync(__dirname + "/.." + process.env.DB_GUILDS + "/" + guild.id + "/", {recursive: true});
    }
    guildCreate(guild) {
        try {
            guild.systemChannel.send(`Hey ! I'm Spam-bot, to give orders you need to go on this website : https://spam-bot.app.\nI can send your messages at anytime of the day event when you're not here to supervise me ;)`);
        } catch(e) {
            console.log("Added bot but no systemChannel has been specified...");
        }
    }
    cronWatcher(self) {
        const timestamp = Math.floor((Date.now()/1000)/60);
        fs.readdir(__dirname + "/.." + process.env.DB_GUILDS + "/", {}, (err, files) => {
            let i = 0;
            console.log(files.length);
            files.forEach(guildId => fs.readFile(__dirname + "/.." + process.env.DB_GUILDS + "/" + guildId + "/data.json", (err, file) => {
                //Pour chaque guild on regarde si on doit envoyer un message
                const guildData = JSON.parse(file);
                let indexToDeletePonctual = [];

                guildData.ponctual.forEach((ponctualEvent, index) => {
                    if (ponctualEvent.timestamp == timestamp) {
                        const date = new Date();
                        try {
                            bot.channels.cache.get(ponctualEvent.channel_id).send(ponctualEvent.sys_content || ponctualEvent.message).then(message => {
                                console.log(`New punctual message sent at ${date.getDate()}/${date.getUTCMonth()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`);
                                i++;
                            }).catch(e => {
                                console.log(`Error sending message (probably admin rights) to channel : ${ponctualEvent.channel_id}`);
                            });
                        } catch (e) {
                            self.removeDeletedChannels(guildId, ponctualEvent.channel_id);
                        }
                        indexToDeletePonctual.push(index);
                    }
                });

                guildData.freq.forEach((freqEvent) => {
                    const cronInstance = new Cron();
                    cronInstance.fromString(freqEvent.cron);
                    const scheduler = cronInstance.schedule();
                    const timestampToExec = Math.floor(scheduler.next().unix()/60);
                    // console.log(`freq next  : ${timestampToExec}`);
                    // console.log(`Actual : ${timestamp}`);
        
                    if (timestampToExec == timestamp) {
                        try {
                            bot.channels.cache.get(freqEvent.channel_id).send(freqEvent.sys_content || freqEvent.message).then(message => {
                                console.info(`New frequential message sent to ${bot.channels.cache.get(freqEvent.channel_id).name} in ${bot.channels.cache.get(freqEvent.channel_id).guild.name}`);
                                i++;
                            }).catch(e => {
                                console.log(`Error sending message (probably admin rights) to channel : ${freqEvent.channel_id}`);
                            });
                        } catch (e) {
                            self.removeDeletedChannels(guildId, freqEvent.channel_id);
                        }
                    }
                });

                indexToDeletePonctual.forEach((index) => {
                    const ponctualEvent = guildData.ponctual[index];
                    delete guildData.ponctual[index];
                    guildData.deleted.push(ponctualEvent);
                });
                if (indexToDeletePonctual.length > 0) {
                    guildData.ponctual = guildData.ponctual.filter(element => element != null);
                    fs.writeFileSync(__dirname + "/.." + process.env.DB_GUILDS + "/" + guildId + "/data.json", JSON.stringify(guildData));
                }
            }));

            setTimeout(() => {
                console.log(`<----------- Sent ${i} messages ----------->`);
                messageSentAverage = Math.ceil((messageSentAverage + i)/2); //Calcul de moyenne de messages envoyé chaque minute
            }, 1000*50); //10 secondes après (le temps que tout s'envoie on affiche le nombre de message envoyé et on calcul la moyenne) 
            
        });
    }

    async sendStats() {
        const channel = bot.channels.cache.get(STAT_CHANNEL);
        const lengthServer = fs.readdirSync(__dirname+"/.."+process.env.DB_GUILDS).length;
        const lengthUsers = Object.keys(JSON.parse(fs.readFileSync(__dirname + "/../data/users.json"))).length;
        channel.send(`Nombre de serveurs : **${lengthServer}**`);
        channel.send(`Nombre d'utilisateurs : **${lengthUsers}**`);
        channel.send(`Moyenne de messages envoyé par minutes : **${messageSentAverage}**`);
        messageSentAverage = 0;
    }

    removeDeletedChannels(guildId, channelId) {
        console.log(`Removing channel : ${channelId} in guild : ${guildId}`);
        const data = JSON.parse(fs.readFileSync(__dirname + "/.." + process.env.DB_GUILDS + "/" + guildId + "/data.json",));
        //On supprime le channel correspondant au channelid dans freq et ponctual
        data.freq = data.freq.map(el => el.channel_id != channelId ? el : null);
        data.freq = data.freq.filter(element => element != null);   //On supprime les index null
        data.ponctual = data.ponctual.map(el => el.channel_id != channelId ? el : null);
        data.ponctual = data.ponctual.filter(element => element != null);

        fs.writeFileSync(__dirname + "/.." + process.env.DB_GUILDS + "/" + guildId + "/data.json", JSON.stringify(data));
    }

    //Return channels collection or false
    getChannels(id) {
        if (!id) return;
        try {
            const dataToSend = bot.guilds.cache.get(id).channels.cache;
            return dataToSend;
        } catch(e) {
            console.log(e);
            return false;
        }
    }
    getGuild(id) {
        if (!id) return;
        try {
            const dataToSend = bot.guilds.cache.get(id);
            return  dataToSend;
        } catch (e) {
            console.log(e);
            return false;
        }
    }
    getPeople(id) {
        if (!id) return;
        try {
            const dataToSend = bot.guilds.cache.get(id).members.cache;
            return dataToSend;
        } catch (e) {
            console.log(e);
            return false;
        }
    }
}

module.exports = Bot;