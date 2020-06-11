const Discord = require('discord.js');
const dotenv = require("dotenv");
const Cron = require("cron-converter");
const fs = require("fs");
const bot = new Discord.Client();
let messageSent = 0;

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
    /**
     * Handler triggered when the bot is ready and connected
     * @param {Bot} self 
     */
    ready(self) {
        console.info(`Logged in as ${bot.user.tag} !\n`);
        //On attend le passage à la prochaine minute pour être le plus syncro possible
        const oldMinute = Math.floor((new Date().getTime()/1000)/60)*60;
        console.log(`Actual minute : ${new Date().getMinutes()}`);
        console.log("Waiting for new minute to start cron watcher");
        const intervalId = setInterval((self) => {
            if (Math.floor((new Date().getTime()/1000)/60)*60 > oldMinute) {
                console.log(`\n\nNew minute detected, Starting cron Watcher at minute ${new Date().getMinutes()}`);
                this.cronWatcher(this);
                bot.setInterval(() => self.cronWatcher(self), 1000*60);  //Si on est passé à une nouvelle minute on lance le cronWatcher
                clearInterval(intervalId);
            }
        }, 10, self);
    }
    /**
     * Handler for event when the bot is removed from a guild
     * @param {Discord.Guild} guild 
     */
    guildDelete(guild) {
        fs.rmdirSync(__dirname + "/.." + process.env.DB_GUILDS + "/" + guild.id + "/", {recursive: true});
    }
    /**
     * Handler for event when the bot is added to a guild
     * @param {Discord.Guild} guild
     */
    guildCreate(guild) {
        try {
            guild.systemChannel.send(`Hey ! I'm Automate, to give orders you need to go on this website : https://automatebot.app.\nI can send your messages at anytime of the day event when you're not here to supervise me ;)`);
        } catch(e) {
            console.log("Added bot but no systemChannel has been specified...");
        }
    }
    /**
     * Send all messages supposed to be sended, every minutes
     * @param {Bot} self actual instance of the bot
     */
    cronWatcher(self) {
        const date = new Date();
        fs.readdir(__dirname + "/.." + process.env.DB_GUILDS + "/", {}, (err, files) => {
            let i = 0;
            files.forEach(guildId => fs.readFile(__dirname + "/.." + process.env.DB_GUILDS + "/" + guildId + "/data.json", (err, file) => {
                //Pour chaque guild on regarde si on doit envoyer un message
                const guildData = JSON.parse(file);
                let indexToDeletePonctual = [];
                const timestamp = Math.floor(Date.now()/1000/60);

                guildData.ponctual.forEach((ponctualEvent, index) => {
                    if (ponctualEvent.timestamp == timestamp) {
                        try {
                            bot.channels.cache.get(ponctualEvent.channel_id).send(ponctualEvent.sys_content || ponctualEvent.message).then(message => {
                                console.log(`New punctual message sent at ${date.getUTCDate()}/${date.getUTCMonth()}/${date.getUTCFullYear()} ${date.getUTCHours()}:${date.getUTCMinutes()}`);
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
                    const cronInstance = new Cron({timezone: guildData.timezone_code});
                    cronInstance.fromString(freqEvent.cron);
                    const scheduler = cronInstance.schedule();
                    const timestampToExec = Math.floor(scheduler.next().unix()/60);

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
                messageSent += i; //Calcul de moyenne de messages envoyé chaque minute
            }, 1000*30); //30 secondes après (le temps que tout s'envoie on affiche le nombre de message envoyé et on calcul la moyenne) 
            
        });
    }
    /**
     * Send stats to logs channel function
     * @return {Promise}
     */
    async sendStats() {
        const channel = bot.channels.cache.get(STAT_CHANNEL);
        const lengthServer = fs.readdirSync(__dirname+"/.."+process.env.DB_GUILDS).length;
        const lengthUsers = Object.keys(JSON.parse(fs.readFileSync(__dirname + "/../data/users.json"))).length;
        channel.send(`Nombre de serveurs : **${lengthServer}**`);
        channel.send(`Nombre d'utilisateurs : **${lengthUsers}**`);
        channel.send(`Messages envoyé en une heure : **${messageSent}**`);
        messageSent = 0;
    }

    /**
     * @param {string} guildId 
     * @param {string} channelId 
     */
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

    /**
     * Get channels from a guild id
     * @param {string} id
     * @returns {Discord.Collection<string, Discord.GuildChannel>|boolean} Channels collection 
     */
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
    /**
     * Get the information of a guild
     * @param {string} id
     * @returns {Discord.Guild|boolean} guildCollection 
     */
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
    /**
     * Get people from a guild id 
     * @param {string} id
     * @returns {Discord.Collection<string, Discord.GuildMember>|boolean} GuildMember collection
     */
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
    /**
     * Get roles from a guild id
     * @param {string} id
     * @returns {Discord.Collection<string, Discord.Role>}
     */
    getRoles(id) {
        if (!id) return;
        try {
            const dataToSend = bot.guilds.cache.get(id).roles.cache;
            return dataToSend;
        } catch(e) {
            console.log(e);
            return false;
        }
    }
}

module.exports = Bot;