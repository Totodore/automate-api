import * as Discord from "discord.js";
import * as Cron from "cron-converter";
import * as fs from "fs";
import Logger from "./utils/logger";
let messageSent = 0;

const STAT_CHANNEL = "702970284034097192";

class Bot extends Logger {

    private bot: Discord.Client = new Discord.Client();
    constructor() {
        super("Bot");

        this.bot.login(process.env.TOKEN_BOT);
        this.bot.on("ready", () => this.ready());
        this.bot.on("guildCreate", (guild: Discord.Guild) => this.guildDelete(guild));
        this.bot.on("guildDelete", (guild: Discord.Guild) => this.guildDelete(guild));
        this.bot.setInterval(() => this.sendStats(), 1000*60*60*24); //Stats toutes les jours
    }
    /**
     * Handler triggered when the this.bot is ready and connected
     */
    private ready(): void {
        this.log(`Logged in as ${this.bot.user.tag} !\n`);
        //On attend le passage à la prochaine minute pour être le plus syncro possible
        const oldMinute = Math.floor((new Date().getTime()/1000)/60)*60;
        this.log(`Actual minute : ${new Date().getMinutes()}`);
        this.log("Waiting for new minute to start cron watcher");

        const intervalId = setInterval(() => {
            //Si on est passé à une nouvelle minute on lance le cronWatcher
            if (Math.floor((new Date().getTime()/1000)/60)*60 > oldMinute) {
                this.log(`\n\nNew minute detected, Starting cron Watcher at minute ${new Date().getMinutes()}`);
                this.cronWatcher();
                this.bot.setInterval(() => this.cronWatcher(), 1000*60); 
                clearInterval(intervalId);
            }
        }, 10);
    }
    /**
     * Handler for event when the this.bot is removed from a guild
     */
    private guildDelete(guild: Discord.Guild) {
        fs.rmdirSync(__dirname + "/.." + process.env.DB_GUILDS + "/" + guild.id + "/", {recursive: true});
    }
    /**
     * Handler for event when the this.bot is added to a guild
     */
    private guildCreate(guild: Discord.Guild) {
        try {
            guild.systemChannel.send(`Hey ! I'm Automate, to give orders you need to go on this website : https://automatebot.app.\nI can send your messages at anytime of the day event when you're not here to supervise me ;)`);
        } catch(e) {
            this.log("Added this.bot but no systemChannel has been specified...");
        }
    }
    /**
     * Send all messages supposed to be sended, every minutes
     */
    private cronWatcher() {
        const date = new Date();
        fs.readdir(__dirname + "/.." + process.env.DB_GUILDS + "/", {}, (err, files) => {
            let i = 0;
            files.forEach(guildId => fs.readFile(__dirname + "/.." + process.env.DB_GUILDS + "/" + guildId + "/data.json", (err, file) => {
                //Pour chaque guild on regarde si on doit envoyer un message
                const guildData = JSON.parse(file.toString());
                let indexToDeletePonctual = [];
                const timestamp = Math.floor(Date.now()/1000/60);

                guildData.ponctual.forEach((ponctualEvent, index) => {
                    if (ponctualEvent.timestamp == timestamp) {
                        try {
                            const channel = this.bot.channels.cache.get(ponctualEvent.channel_id) as Discord.TextChannel; 
                            channel.send(ponctualEvent.sys_content || ponctualEvent.message).then(message => {
                                this.log(`New punctual message sent at ${date.getUTCDate()}/${date.getUTCMonth()}/${date.getUTCFullYear()} ${date.getUTCHours()}:${date.getUTCMinutes()}`);
                                i++;
                            }).catch(e => {
                                this.log(`Error sending message (probably admin rights) to channel : ${ponctualEvent.channel_id}`);
                            });
                        } catch (e) {
                            this.removeDeletedChannels(guildId, ponctualEvent.channel_id);
                        }
                        indexToDeletePonctual.push(index);
                    }
                });

                guildData.freq.forEach((freqEvent) => {
                    if (freqEvent.cron.split(" ")[0] == "60")
                        return;
                    const cronInstance = new Cron({timezone: guildData.timezone_code});
                    cronInstance.fromString(freqEvent.cron);
                    const scheduler = cronInstance.schedule();
                    const timestampToExec = Math.floor(scheduler.next().unix()/60);

                    if (timestampToExec == timestamp) {
                        try {
                            const channel = this.bot.channels.cache.get(freqEvent.channel_id) as Discord.TextChannel; 
                            channel.send(freqEvent.sys_content || freqEvent.message).then(message => {
                                console.info(`New frequential message sent to ${channel.name} in ${channel.guild.name}`);
                                i++;
                            }).catch(e => {
                                this.log(`Error sending message (probably admin rights) to channel : ${freqEvent.channel_id}`);
                            });
                        } catch (e) {
                            this.removeDeletedChannels(guildId, freqEvent.channel_id);
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
                this.log(`<----------- Sent ${i} messages ----------->`);
                messageSent += i; //Calcul de moyenne de messages envoyé chaque minute
            }, 1000*30); //30 secondes après (le temps que tout s'envoie on affiche le nombre de message envoyé et on calcul la moyenne) 
            
        });
    }
    /**
     * Send stats to logs channel function
     */
    private async sendStats(): Promise<void> {
        const channel = this.bot.channels.cache.get(STAT_CHANNEL) as Discord.TextChannel;
        const lengthServer = fs.readdirSync(__dirname+"/.."+process.env.DB_GUILDS).length;
        const lengthUsers = Object.keys(JSON.parse(fs.readFileSync(__dirname + "/../data/users.json").toString())).length;
        channel.send(`Nombre de serveurs : **${lengthServer}**`);
        channel.send(`Nombre d'utilisateurs : **${lengthUsers}**`);
        channel.send(`Messages envoyé en une heure : **${messageSent}**`);
        messageSent = 0;
    }

    private removeDeletedChannels(guildId: string, channelId: string) {
        this.log(`Removing channel : ${channelId} in guild : ${guildId}`);
        const data = JSON.parse(fs.readFileSync(__dirname + "/.." + process.env.DB_GUILDS + "/" + guildId + "/data.json",).toString());
        //On supprime le channel correspondant au channelid dans freq et ponctual
        data.freq = data.freq.map(el => el.channel_id != channelId ? el : null);
        data.freq = data.freq.filter(element => element != null);   //On supprime les index null
        data.ponctual = data.ponctual.map(el => el.channel_id != channelId ? el : null);
        data.ponctual = data.ponctual.filter(element => element != null);

        fs.writeFileSync(__dirname + "/.." + process.env.DB_GUILDS + "/" + guildId + "/data.json", JSON.stringify(data));
    }

    /**
     * Get channels from a guild id
     */
    public getChannels(id: string): Discord.Collection<string, Discord.GuildChannel>|boolean {
        if (!id) return;
        try {
            const dataToSend = this.bot.guilds.cache.get(id).channels.cache;
            return dataToSend;
        } catch(e) {
            this.log(e);
            return false;
        }
    }
    /**
     * Get the information of a guild
     */
    public getGuild(id: string): Discord.Guild|boolean {
        if (!id) return;
        try {
            const dataToSend = this.bot.guilds.cache.get(id);
            return  dataToSend;
        } catch (e) {
            this.log(e);
            return false;
        }
    }
    /**
     * Get people from a guild id 
     */
    public getPeople(id: string): Discord.Collection<string, Discord.GuildMember>|boolean {

        if (!id) return;
        try {
            const dataToSend = this.bot.guilds.cache.get(id).members.cache;
            return dataToSend;
        } catch (e) {
            this.log(e);
            return false;
        }
    }
    /**
     * Get roles from a guild id
     */
    public getRoles(id: string): Discord.Collection<string, Discord.Role>|boolean {
        if (!id) return;
        try {
            const dataToSend = this.bot.guilds.cache.get(id).roles.cache;
            return dataToSend;
        } catch(e) {
            this.log(e);
            return false;
        }
    }
}

export default Bot;