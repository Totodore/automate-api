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
    this.currentQuota = guild.quotas.find(el => el.date.getTime() >= new Date(new Date().getFullYear(), new Date().getMonth()).getTime()).monthlyQuota;
    this.removeOneTimeMessage = guild.removeOneTimeMessage;
    this.scope = guild.scope;
    this.channels = guildInfo.channels.cache.array()
      .filter(el => el.type == "text" || el.type == "news")
      .map(el => ({ name: el.name, id: el.id }));
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