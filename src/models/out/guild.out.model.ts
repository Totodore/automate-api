import { monthDate } from './../../utils/timezones.util';
import { GuildInfo } from 'passport-discord';
import { Guild } from 'src/database/guild.entity';
import { Message } from 'src/database/message.entity';
import * as Discord from "discord.js";
import { Webhook } from 'src/database/webhook.entity';

export class GuildOutModel {
  
  public messages: Message[];
  public channels: GuildElement[];
  public webhooks: WebhookInfo[];
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
    guildInfo: Discord.Guild,
    guildWebhooks: Discord.Webhook[],
  ) {
    this.id = guildInfo.id;
    this.messages = guild.messages;
    this.timezone = guild.timezone;
    this.maxQuota = guild.monthlyQuota;
    this.currentQuota = guild.quotas.find(el => el.date.getTime() >= monthDate().getTime())?.monthlyQuota || 0;
    this.removeOneTimeMessage = guild.removeOneTimeMessage;
    this.scope = guild.scope;
    this.channels = guildInfo.channels.cache.array()
      .filter(el => el.type == "text" || el.type == "news")
      .map(el => ({ name: el.name, id: el.id, type: TagType.Channel }));
    this.roles = guildInfo.roles.cache.array().map(el => ({ name: el.name, id: el.id, type: TagType.Role }));
    this.webhooks = guildWebhooks.map(el => ({ channel: el.channelID, avatar: el.avatarURL({ size: 256, format: "jpeg" }), id: el.id, name: el.name, url: el.url }));
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

export class WebhookInfo {
  id: string;
  name: string;
  avatar: string;
  url: string;
  channel: string;
}

export enum TagType {
  Role,
  Person,
  Channel
}