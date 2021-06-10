import { CacheService } from './cache.service';
import { monthDate } from './../utils/timezones.util';
import { Quota } from './../database/quota.entity';
import { AppLogger } from './../utils/app-logger.util';
import { Message } from './../database/message.entity';
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Discord from "discord.js";
import { Guild } from 'src/database/guild.entity';
import { EventEmitter } from 'events';
import { LessThan } from 'typeorm';

@Injectable()
export class BotService implements OnModuleInit {
  
  private bot!: Discord.Client;
  public readonly automateGuildID = "702623012465278978";
  public readonly newGuildEmitter = new EventEmitter();
  constructor(
    private readonly logger: AppLogger,
    private readonly cache: CacheService
  ) {}
  
  public async onModuleInit() {
    const intents = new Discord.Intents(Discord.Intents.NON_PRIVILEGED);
    intents.add("GUILD_MEMBERS");
    this.bot = new Discord.Client({ ws: { intents } });
    this.bot.on("guildCreate", (guild) => this.onGuildCreate(guild));
    this.bot.on("guildDelete", (guild) => this.onGuildDelete(guild));
    this.bot.on("error", this.logger.error);
    this.bot.on("channelDelete", (channel) => this.onChannelDelete(channel));
    try {
      await this.bot.login(process.env.TOKEN_BOT);
      this.logger.log(this.bot.user.username, "successfully logged in !");
    } catch (e) {
      this.logger.error(e);
    }
  }

  /**
	 * Get channels from a guild id
	 * Filter channels remove deleted ones and other than text or news channel
	 */
  public async getChannels(guildId: string): Promise<(Discord.TextChannel | Discord.NewsChannel)[]> {
    try {
      return (await this.getGuild(guildId))
        ?.channels?.cache
        ?.filter(el => !el.deleted && (el.type === "text" || el.type === "news"))
        ?.array() as (Discord.TextChannel | Discord.NewsChannel)[];
    } catch (error) { this.logger.error(error); }
  }

  public async getGuild(guildId: string): Promise<Discord.Guild> {
    return await this.bot.guilds.fetch(guildId);
  }

  public async getPeople(guildId: string): Promise<Discord.GuildMember[]> {
    return (await this.getGuild(guildId)).members.cache.array();
  }

  public async getRoles(guildId: string): Promise<Discord.Role[]> {
    return (await this.bot.guilds.fetch(guildId)).roles.cache.array();
  }

  public async getChannel(channelId: string): Promise<Discord.GuildChannel> {
    const channel = await this.bot.channels.fetch(channelId);
    if (channel instanceof Discord.GuildChannel)
      return channel;
  }
  public async getUser(userId: string): Promise<Discord.User> {
    return this.bot.users.fetch(userId);
  }
  public async isInAutomateDiscord(userId: string): Promise<boolean> {
    return (await this.getGuild(this.automateGuildID)).member(userId) != null;
  }

  private async onGuildCreate(guild: Discord.Guild) {
    await guild.systemChannel?.send(`Hey ! I'm Automate, to give me orders you need to go on this website : https://automatebot.app.\nI can send your messages at anytime of the day event when you're not here to supervise me ;)`);
    await Guild.create({ id: guild.id, deletedDate: null }).save();
    this.newGuildEmitter.emit(guild.id);
  }

  private async onGuildDelete(guild: Discord.Guild) {
    const guildEl = await Guild.softRemove(Guild.create({ id: guild.id }));
    await Message.delete({ guild: guildEl });
    await Quota.delete({ guild: guildEl, date: LessThan(monthDate()) });
    this.cache.removeGuildFromCache(guild.id);
  }

  private async onChannelDelete(channel: Discord.Channel) {
    const infos = await Message.delete({ channelId: channel.id });
    if (infos.affected > 0)
      this.logger.log(`Channel removed, ${infos.affected} messages removed`);
  }
}
