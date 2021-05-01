import { AppLogger } from './../utils/app-logger.util';
import { Message } from './../database/message.entity';
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Discord from "discord.js";
import { Guild } from 'src/database/guild.entity';

@Injectable()
export class BotService implements OnModuleInit {
  
  private readonly bot = new Discord.Client();

  constructor(
    private readonly logger: AppLogger
  ) {}
  
  public async onModuleInit() {
    this.bot.on("guildCreate", (guild) => this.onGuildCreate(guild));
    this.bot.on("guildDelete", (guild) => this.onGuildDelete(guild));
    this.bot.on("channelDelete", (channel) => this.onChannelDelete(channel));
    await this.bot.login(process.env.TOKEN_BOT);
    await new Promise<void>((resolve) => this.bot.on("ready", resolve));
    this.logger.log(this.bot.user.username, "successfully logged in !");
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

  private async onGuildCreate(guild: Discord.Guild) {
    await guild.systemChannel?.send(`Hey ! I'm Automate, to give me orders you need to go on this website : https://automatebot.app.\nI can send your messages at anytime of the day event when you're not here to supervise me ;)`);
  }

  private async onGuildDelete(guild: Discord.Guild) {
    await (await Guild.findOne(guild.id))?.remove();
  }

  private async onChannelDelete(channel: Discord.Channel) {
    const infos = await Message.delete({ channelId: channel.id });
    if (infos.affected > 0)
      this.logger.log(`Channel removed, ${infos.affected} messages removed`);
  }


}
