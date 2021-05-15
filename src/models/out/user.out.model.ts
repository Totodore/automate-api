import { GuildInfo } from 'passport-discord';
import { Profile } from 'passport-discord';
export class AuthOutModel {

  constructor(
    public readonly token: string,
    public readonly profile: DiscordProfile
  ) {}
}

export interface DiscordProfile extends Profile {
  guilds: DiscordGuild[];
  joinedServer: boolean;
}

export interface DiscordGuild extends GuildInfo {
  added: boolean;
}