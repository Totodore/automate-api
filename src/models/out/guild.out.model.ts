import { monthDate } from './../../utils/timezones.util';
import { GuildInfo } from 'passport-discord';
import { Guild } from 'src/database/guild.entity';
import { Message } from 'src/database/message.entity';
import * as Discord from "discord.js";

export class GuildOutModel {
  
  public messages: Message[];
  public channels: GuildElement[];
  public timezone: string;
  public name: string;
  public roles: GuildElement[];
  public id: string;
  public scope: boolean;
  public currentQuota: number;
  public maxQuota: number;
  public removeOneTimeMessage: boolean;
  

  constructor(
    guild: Guild,
    guildInfo: Discord.Guild
  ) {
    this.id = guildInfo.id;
    this.messages = guild.messages;
    this.timezone = guild.timezone;
    this.maxQuota = guild.monthlyQuota;
    this.currentQuota = guild.quotas.find(el => el.date.getTime() >= monthDate().getTime())?.monthlyQuota || 0;
    this.removeOneTimeMessage = guild.removeOneTimeMessage;
    this.scope = guild.scope;
    this.channels = guildInfo.channels.cache
      .filter(el => el.type == "GUILD_TEXT" || el.type == "GUILD_NEWS")
      .map(el => ({ name: el.name, id: el.id, type: TagType.Channel }));
    this.roles = guildInfo.roles.cache.map(el => ({ name: el.name, id: el.id, type: TagType.Role }));
  }
}

export class MemberOutModel {

  constructor(
    public name: string,
    public username: string,
    public id: string,
    public type = TagType.Person
  ) {}
}

export interface GuildElement {
  name: string;
  id: string;
  type: TagType;
}

export interface GuildInfoProfile extends GuildInfo {
  added: boolean;
}

export enum TagType {
  Role,
  Person,
  Channel
}