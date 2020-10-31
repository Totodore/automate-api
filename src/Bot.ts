import * as Discord from "discord.js";
import * as Cron from "cron-converter";
import * as fs from "fs";
import Logger from "./utils/Logger";
import FileLogger from "./utils/FileLogger";
import DBManager from "./utils/DBManager";
import { MessageType } from "./models/MessageModel";

const STAT_CHANNEL = "702970284034097192";

class Bot {

	private bot: Discord.Client = new Discord.Client();
	private messageSent: number = 0;
	private dbManager: DBManager;
	private messageSentBatch: number = 0;
	private logger: Logger;
	private fileLogger: FileLogger;
	private cronWatcherId: NodeJS.Timer;

	constructor() {
		this.logger = new Logger("BOT", true);
		this.fileLogger = new FileLogger("BOT", true);

		this.dbManager = new DBManager();
		this.dbManager.init().then(async () => {
			await this.fileLogger.init();

			this.bot.login(process.env.TOKEN_BOT);
			this.bot.on("ready", () => this.ready());
			this.bot.on("guildCreate", (guild: Discord.Guild) => this.guildCreate(guild));
			this.bot.on("guildDelete", (guild: Discord.Guild) => this.guildDelete(guild));
			this.bot.on("channelDelete", (channel: Discord.Channel) => this.channelDelete(channel));
		});
	}
	/**
	 * Handler triggered when the this.bot is ready and connected
	 */
	private ready(): void {
		this.logger.log(`Logged in as ${this.bot.user.tag} !\n`);
		//On attend le passage à la prochaine minute pour être le plus syncro possible
		this.logger.log(`Actual minute : ${new Date().getMinutes()}`);
		this.logger.log("Waiting for new minute to start cron watcher");
		this.launchCronWatcher(); 
		setInterval(() => this.launchCronWatcher(), 1000*60*60*6); 
		// Reset cronWatch every 6hour
	}

	/**
	 * Launch cron watcher by detecting new minute modification
	 */
	private launchCronWatcher(): void {
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
	private async guildDelete(guild: Discord.Guild) {
		try {
			await this.dbManager.Guild.destroy({where: {id: guild.id}});
			await this.dbManager.Message.destroy({where: {guild_id: guild.id}});
		} catch (e) {
			this.logger.error(e);
		}
	}
	/**
	 * Handler for event when the this.bot is added to a guild
	 */
	private guildCreate(guild: Discord.Guild) {
		try {
			guild.systemChannel.send(`Hey ! I'm Automate, to give me orders you need to go on this website : https://automatebot.app.\nI can send your messages at anytime of the day event when you're not here to supervise me ;)`);
		} catch (e) {
			this.logger.log("Added bot but no systemChannel has been specified...");
		}
	}
	/**
	 * On channel delete, make sure to remove all message supposed to be send to the channel
	 * @param channel deleted channel
	 */
	private async channelDelete(channel: Discord.Channel) {
		const messageLength = await this.dbManager.Message.destroy({ where: { channel_id: channel.id }, force: true });
		this.logger.log("Channel deleted, removing messages from DB");
	}
	/**
	 * Send all messages supposed to be sended, every minutes
	 * Store all promises message to two array and await the resolving of all the message sending
	 * TO then print logs every hour
	 */
  	private async cronWatcher() {
		if (new Date().getHours() == 0 && new Date().getMinutes() == 0)
			this.sendStats();

		const messagesData = await this.dbManager.Message.findAll();
		let freqPromise: Promise<Discord.Message>[] = [];
		let ponctualPromise: Promise<Discord.Message>[] = [];
		let messagesToBeSent = 0;
		
		this.fileLogger.log(`Number of messages ${messagesData.length}`);

		const timestamp = Math.floor(Date.now() / 1000 / 60);
		this.fileLogger.log(`Current Timestamp of ${timestamp} ${new Date(timestamp)}`);
		for (const message of messagesData) {
			const data = message.get();

			if (data.type == MessageType.Ponctual && data.timestamp == timestamp) {
				messagesToBeSent++;
				const channel = this.bot.channels.cache.get(data.channel_id) as Discord.TextChannel;
				try {
					const promise: Promise<Discord.Message> = channel.send(data.sys_content || data.message);
					promise.then((message: Discord.Message) => this.onMessageSend(MessageType.Ponctual, message));
					promise.catch((e) => this.onMessageError(MessageType.Ponctual, channel.id, e));
					
					freqPromise.push(promise);
				} catch(e) {
					this.onMessageError(MessageType.Ponctual, channel.id, new Error("Before sending Ponctual Message error"));
				}

			} else if (data.type == MessageType.Frequential) {
				if (data.cron.split(" ")[0] == "60")
					return;
				const cronInstance = new Cron({ timezone: data.timezone_code });
				cronInstance.fromString(data.cron);
				const scheduler = cronInstance.schedule();
				const timestampToExec = Math.floor(scheduler.next().unix() / 60);

				if (timestampToExec == timestamp) {

					messagesToBeSent++;
					const channel = this.bot.channels.cache.get(data.channel_id) as Discord.TextChannel;
					try {
						const promise: Promise<Discord.Message> = channel.send(data.sys_content || data.message);
						promise.then((message: Discord.Message) => this.onMessageSend(MessageType.Frequential, message));
						promise.catch((e) => this.onMessageError(MessageType.Frequential, channel.id, e));
						ponctualPromise.push(promise);
					} catch(e) {
						this.onMessageError(MessageType.Frequential, channel?.id, new Error("Before sending Frequencial message error"));
					}

				}
			}
		}
		await Promise.all(freqPromise);
		await Promise.all(ponctualPromise);
		this.logger.log(`<----------- Sent ${this.messageSentBatch}/${messagesToBeSent} messages ----------->`);
		this.messageSent += this.messageSentBatch; //Calcul du nombre de messages envoyés par heure
		this.messageSentBatch = 0;
	}

	private async onMessageSend(messageType: MessageType, message: Discord.Message): Promise<void> {
		this.logger.log(new Date().toDateString(), new Date().toTimeString(),`New ${messageType} message sent to ${message.guild.id}`);
		this.messageSentBatch++;
	}

	private async onMessageError(messageType: MessageType, channelId: string, e: Error): Promise<void> {
		this.logger.log(new Date().toDateString(), new Date().toTimeString(), `Error sending ${messageType} message to channel : ${channelId}`);
		this.logger.error(e);
	}
	/**
	 * Send stats to logs channel function
	 */
	private async sendStats(): Promise<void> {
		const channel = this.bot.channels.cache.get(STAT_CHANNEL) as Discord.TextChannel;
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
	public getChannels(id: string): Discord.Collection<string, Discord.GuildChannel> {
		if (!id) return;
		try {
			const dataToSend = this.bot.guilds.cache.get(id).channels.cache.filter((element) => {
				if (!element.deleted && (element.type == "text" || element.type == "news"))
					return true;
				else return false;
			});
			return dataToSend;
		} catch (e) {
			this.logger.log(e);
		}
	}
	/**
	 * Get the information of a guild
	 */
	public getGuild(id: string): Discord.Guild {
		if (!id) return;
		try {
			const dataToSend = this.bot.guilds.cache.get(id);
			return dataToSend;
		} catch (e) {
			this.logger.log(e);
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
			this.logger.log(e);
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
		} catch (e) {
			this.logger.log(e);
		}
	}
}

export default Bot;