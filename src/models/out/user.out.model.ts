import { User } from './../../database/user.entity';
import { GuildInfo, Profile } from "passport-discord";

export class UserOutModel {
  public avatar: string;
  public name: string;
  public id: string;
  public guilds: GuildInfo[];

  constructor(profile: Profile, user: User) {
    this.avatar = profile.avatar;
    this.name = profile.displayName || profile.username;
    this.guilds = profile.guilds;
    this.id = profile.id;
  }
}