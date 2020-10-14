"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Discord = require("discord.js");
const Cron = require("cron-converter");
const fs = require("fs");
const Logger_1 = require("./utils/Logger");
const FileLogger_1 = require("./utils/FileLogger");
const DBManager_1 = require("./utils/DBManager");
const MessageModel_1 = require("./models/MessageModel");
const STAT_CHANNEL = "702970284034097192";
class Bot {
    constructor() {
        this.bot = new Discord.Client();
        this.messageSent = 0;
        this.messageSentBatch = 0;
        this.logger = new Logger_1.default("BOT", true);
        this.fileLogger = new FileLogger_1.default("BOT", true);
        this.dbManager = new DBManager_1.default();
        this.dbManager.init().then(async () => {
            await this.fileLogger.init();
            this.bot.login(process.env.TOKEN_BOT);
            this.bot.on("ready", () => this.ready());
            this.bot.on("guildCreate", (guild) => this.guildCreate(guild));
            this.bot.on("guildDelete", (guild) => this.guildDelete(guild));
            this.bot.on("channelDelete", (channel) => this.channelDelete(channel));
            this.bot.setInterval(() => this.sendStats(), 1000 * 60 * 60 * 24); //Stats toutes les jours
        });
    }
    /**
     * Handler triggered when the this.bot is ready and connected
     */
    ready() {
        this.logger.log(`Logged in as ${this.bot.user.tag} !\n`);
        //On attend le passage à la prochaine minute pour être le plus syncro possible
        this.logger.log(`Actual minute : ${new Date().getMinutes()}`);
        this.logger.log("Waiting for new minute to start cron watcher");
        this.launchCronWatcher();
        setInterval(() => this.launchCronWatcher(), 1000 * 60 * 60 * 6);
        //Reset cronWatch every 6hour
    }
    /**
     * Launch cron watcher by detecting new minute modification
     */
    launchCronWatcher() {
        const oldMinute = Math.floor((new Date().getTime() / 1000) / 60) * 60;
        const intervalId = setInterval(() => {
            //Si on est passé à une nouvelle minute on lance le cronWatcher
            if (Math.floor((new Date().getTime() / 1000) / 60) * 60 > oldMinute) {
                this.fileLogger.log(`!!! New minute detected, Starting cron Watcher at minute ${new Date().getMinutes()} !!!`);
                this.cronWatcher();
                this.cronWatcherId && clearInterval(this.cronWatcherId);
                this.cronWatcherId = this.bot.setInterval(() => this.cronWatcher(), 1000 * 60);
                clearInterval(intervalId);
            }
        }, 10);
    }
    /**
     * Handler for event when the this.bot is removed from a guild
     */
    guildDelete(guild) {
        fs.rmdirSync(__dirname + "/.." + process.env.DB_GUILDS + "/" + guild.id + "/", { recursive: true });
    }
    /**
     * Handler for event when the this.bot is added to a guild
     */
    guildCreate(guild) {
        try {
            guild.systemChannel.send(`Hey ! I'm Automate, to give me orders you need to go on this website : https://automatebot.app.\nI can send your messages at anytime of the day event when you're not here to supervise me ;)`);
        }
        catch (e) {
            this.logger.log("Added this.bot but no systemChannel has been specified...");
        }
    }
    /**
     * On channel delete, make sure to remove all message supposed to be send to the channel
     * @param channel deleted channel
     */
    async channelDelete(channel) {
        const messageLength = await this.dbManager.Message.destroy({ where: { channel_id: channel.id } });
        this.logger.log("Channel deleted,", messageLength, "messages removed from DB");
    }
    /**
     * Send all messages supposed to be sended, every minutes
     * Store all promises message to two array and await the resolving of all the message sending
     * TO then print logs every hour
     */
    async cronWatcher() {
        const messagesData = await this.dbManager.Message.findAll();
        let freqPromise = [];
        let ponctualPromise = [];
        this.fileLogger.log(`Number of messages ${messagesData.length}`);
        const timestamp = Math.floor(Date.now() / 1000 / 60);
        this.fileLogger.log(`Current Timestamp of ${timestamp} ${new Date(timestamp)}`);
        for (const message of messagesData) {
            const data = message.get();
            if (data.type == MessageModel_1.MessageType.Ponctual && data.timestamp == timestamp) {
                const channel = this.bot.channels.cache.get(data.channel_id);
                try {
                    const promise = channel.send(data.sys_content || data.message);
                    promise.then((message) => this.onMessageSend(MessageModel_1.MessageType.Ponctual, message));
                    promise.catch((e) => this.onMessageError(MessageModel_1.MessageType.Ponctual, channel.id, e));
                    freqPromise.push(promise);
                }
                catch (e) {
                    this.onMessageError(MessageModel_1.MessageType.Ponctual, channel.id, new Error("Before sending Ponctual Message error"));
                }
            }
            else if (data.type == MessageModel_1.MessageType.Frequential) {
                if (data.cron.split(" ")[0] == "60")
                    return;
                const cronInstance = new Cron({ timezone: data.timezone_code });
                cronInstance.fromString(data.cron);
                const scheduler = cronInstance.schedule();
                const timestampToExec = Math.floor(scheduler.next().unix() / 60);
                if (timestampToExec == timestamp) {
                    const channel = this.bot.channels.cache.get(data.channel_id);
                    try {
                        const promise = channel.send(data.sys_content || data.message);
                        promise.then((message) => this.onMessageSend(MessageModel_1.MessageType.Frequential, message));
                        promise.catch((e) => this.onMessageError(MessageModel_1.MessageType.Frequential, channel.id, e));
                        ponctualPromise.push(promise);
                    }
                    catch (e) {
                        this.onMessageError(MessageModel_1.MessageType.Frequential, channel.id, new Error("Before sending Frequencial message error"));
                    }
                }
            }
        }
        await Promise.all(freqPromise);
        await Promise.all(ponctualPromise);
        this.logger.log(`<----------- Sent ${this.messageSentBatch} messages ----------->`);
        this.messageSent += this.messageSentBatch; //Calcul du nombre de messages envoyés par heure
        this.messageSentBatch = 0;
    }
    async onMessageSend(messageType, message) {
        this.logger.log(new Date().toDateString(), new Date().toTimeString(), `New ${messageType} message sent to ${message.guild.id}`);
        this.messageSentBatch++;
    }
    async onMessageError(messageType, channelId, e) {
        this.logger.log(new Date().toDateString(), new Date().toTimeString(), `Error sending ${messageType} message to channel : ${channelId}`);
        this.logger.error(e);
    }
    /**
     * Send stats to logs channel function
     */
    async sendStats() {
        const channel = this.bot.channels.cache.get(STAT_CHANNEL);
        const lengthServer = await this.dbManager.Guild.count();
        const lengthUsers = await this.dbManager.User.count();
        const lengthMessages = await this.dbManager.Message.count();
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
    getChannels(id) {
        if (!id)
            return;
        try {
            const dataToSend = this.bot.guilds.cache.get(id).channels.cache.filter((element) => {
                if (!element.deleted && (element.type == "text" || element.type == "news"))
                    return true;
                else
                    return false;
            });
            return dataToSend;
        }
        catch (e) {
            this.logger.log(e);
        }
    }
    /**
     * Get the information of a guild
     */
    getGuild(id) {
        if (!id)
            return;
        try {
            const dataToSend = this.bot.guilds.cache.get(id);
            return dataToSend;
        }
        catch (e) {
            this.logger.log(e);
        }
    }
    /**
     * Get people from a guild id
     */
    getPeople(id) {
        if (!id)
            return;
        try {
            const dataToSend = this.bot.guilds.cache.get(id).members.cache;
            return dataToSend;
        }
        catch (e) {
            this.logger.log(e);
        }
    }
    /**
     * Get roles from a guild id
     */
    getRoles(id) {
        if (!id)
            return;
        try {
            const dataToSend = this.bot.guilds.cache.get(id).roles.cache;
            return dataToSend;
        }
        catch (e) {
            this.logger.log(e);
        }
    }
}
exports.default = Bot;
