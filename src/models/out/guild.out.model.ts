import { GuildInfo } from 'passport-discord';
import { Guild } from 'src/database/guild.entity';
import { Message } from 'src/database/message.entity';
import * as Discord from "discord.js";

export class GuildOutModel {
  
  public messages: Message[];
  public channels: GuildElement[];
  public timezone: string;
  public timezoneCode: string;
  public name: string;
  public roles: GuildElement[];
  public id: string;
  public scope: boolean;
  public readonly maxMessages = parseInt(process.env.MAX_MESSAGE);

  constructor(
    guild: Guild,
    guildInfo: Discord.Guild
  ) {
    this.id = guildInfo.id;
    this.messages = guild.messages;
    this.timezone = guild.timezone;
    this.scope = guild.scope;
    this.timezoneCode = guild.timezoneCode;
    this.channels = guildInfo.channels.cache.array().map(el => ({ name: el.name, id: el.id }));
    this.roles = guildInfo.roles.cache.array().map(el => ({ name: el.name, id: el.id }));
  }
}

export class MemberOutModel {

  constructor(
    public name: string,
    public username: string,
    public id: string
  ) {}
}

export interface GuildElement {
  name: string;
  id: string;
}

export interface GuildInfoProfile extends GuildInfo {
  added: boolean;
}