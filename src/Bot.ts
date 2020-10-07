import * as Discord from "discord.js";
import * as Cron from "cron-converter";
import * as fs from "fs";
import Logger from "./utils/Logger";
import DBManager from "./utils/DBManager";
import { MessageType } from "./models/MessageModel";

const STAT_CHANNEL = "702970284034097192";

class Bot extends Logger {

    private bot: Discord.Client = new Discord.Client();
    private messageSent: number = 0;

    constructor() {
        super("Bot");

        this.bot.login(process.env.TOKEN_BOT);
        this.bot.on("ready", () => this.ready());
        this.bot.on("guildCreate", (guild: Discord.Guild) => this.guildCreate(guild));
        this.bot.on("guildDelete", (guild: Discord.Guild) => this.guildDelete(guild));
        this.bot.on("channelDelete", (channel: Discord.Channel) => this.channelDelete(channel));
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
            guild.systemChannel.send(`Hey ! I'm Automate, to give me orders you need to go on this website : https://automatebot.app.\nI can send your messages at anytime of the day event when you're not here to supervise me ;)`);
        } catch(e) {
            this.log("Added this.bot but no systemChannel has been specified...");
        }
    }

    private channelDelete(channel: Discord.Channel) {
        
    }
    /**
     * Send all messages supposed to be sended, every minutes
     */
    private async cronWatcher() {
        let i: number = 0;
        const dbManager = new DBManager();
        dbManager.init();
        const date = new Date();
        const messagesData = await dbManager.Message.findAll();
        for (const message of messagesData) {  
            const timestamp = Math.floor(Date.now()/1000/60);
            const data = message.get();
            if (data.type == MessageType.Ponctual && data.timestamp == timestamp) {
                const channel = this.bot.channels.cache.get(data.channel_id) as Discord.TextChannel; 
                channel.send(data.sys_content || data.message).then(message => {
                    this.log(`New punctual message sent at ${date.getUTCDate()}/${date.getUTCMonth()}/${date.getUTCFullYear()} ${date.getUTCHours()}:${date.getUTCMinutes()}`);
                    i++;
                }).catch(e => {
                    this.log(`Error sending message (probably admin rights) to channel : ${data.channel_id}`);
                    this.error(e);
                });
            } else if (data.type == MessageType.Frequential) {
                if (data.cron.split(" ")[0] == "60")
                    return;
                const cronInstance = new Cron({timezone: data.timezone_code});
                cronInstance.fromString(data.cron);
                const scheduler = cronInstance.schedule();
                const timestampToExec = Math.floor(scheduler.next().unix()/60);

                if (timestampToExec == timestamp) {
                    const channel = this.bot.channels.cache.get(data.channel_id) as Discord.TextChannel; 
                    channel.send(data.sys_content || data.message).then(message => {
                        console.info(`New frequential message sent to ${channel.name} in ${channel.guild.name}`);
                        i++;
                    }).catch(e => {
                        this.log(`Error sending message (probably admin rights) to channel : ${data.channel_id}`);
                    });
                }
            }
            setTimeout(() => {
                this.log(`<----------- Sent ${i} messages ----------->`);
                this.messageSent += i; //Calcul de moyenne de messages envoyé chaque minute
            }, 1000*50); //30 secondes après (le temps que tout s'envoie on affiche le nombre de message envoyé et on calcul la moyenne) 
        }
    }
    /**
     * Send stats to logs channel function
     */
    private async sendStats(): Promise<void> {
        const dbManager = new DBManager();
        dbManager.init();
        const channel = this.bot.channels.cache.get(STAT_CHANNEL) as Discord.TextChannel;
        const lengthServer = dbManager.Guild.count();
        const lengthUsers = dbManager.User.count();
        const lengthMessages = dbManager.Message.count();
        channel.send(`Nombre de serveurs : **${lengthServer}**`);
        channel.send(`Nombre d'utilisateurs : **${lengthUsers}**`);
        channel.send(`Messages programés : **${lengthMessages}**`);
        channel.send(`Messages envoyé en une heure : **${this.messageSent}**`);
        this.messageSent = 0;
    }

    /**
     * Get channels from a guild id
     * Filter channels remove deleted ones and other than text or news channel
     */
    public getChannels(id: string): Discord.Collection<string, Discord.GuildChannel>{
        if (!id) return;
        try {
            const dataToSend = this.bot.guilds.cache.get(id).channels.cache.filter((element) => {
                if (!element.deleted && (element.type == "text" || element.type == "news"))
                    return true;
                else return false;
            });
            return dataToSend;
        } catch(e) {
            this.log(e);
        }
    }
    /**
     * Get the information of a guild
     */
    public getGuild(id: string): Discord.Guild {
        if (!id) return;
        try {
            const dataToSend = this.bot.guilds.cache.get(id);
            return  dataToSend;
        } catch (e) {
            this.log(e);
        }
    }
    /**
     * Get people from a guild id 
     */
    public getPeople(id: string): Discord.Collection<string, Discord.GuildMember> {

        if (!id) return;
        try {
            const dataToSend = this.bot.guilds.cache.get(id).members.cache;
            return dataToSend;
        } catch (e) {
            this.log(e);
        }
    }
    /**
     * Get roles from a guild id
     */
    public getRoles(id: string): Discord.Collection<string, Discord.Role> {
        if (!id) return;
        try {
            const dataToSend = this.bot.guilds.cache.get(id).roles.cache;
            return dataToSend;
        } catch(e) {
            this.log(e);
        }
    }
}

export default Bot;