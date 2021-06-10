import { AppLogger } from 'src/utils/app-logger.util';
import { Profile } from 'passport-discord';
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class CacheService implements OnModuleInit {
  
  constructor(
    private readonly logger: AppLogger
  ) { }
  
  private readonly profiles = new Map<string, [number, Profile]>();
  private readonly ttl = 60_000 * 5;

  public onModuleInit() {
    setInterval(() => this.ttlWatcher(), 1000);
    this.logger.log("Starting cache service with ttl of", this.ttl / 60_000, "minutes");
  }


  public set(key: string, profile: Profile) {
    this.profiles.set(key, [Date.now(), profile]);
  }

  public get(key: string): Profile | null {
    return this.profiles.get(key)?.[1] || null;
  }

  public del(key: string) {
    this.profiles.delete(key);
  }

  /**
   * Remove all cached users where they have the specified guild
   * @param guildId that guild to find to delete users
   */
  public removeWhereGuild(guildId: string) {
    for (const [key, [ttl, val]] of this.profiles.entries()) {
      if (val.guilds.find(el => el.id == guildId))
        this.profiles.delete(key);
    }
  }


  public ttlWatcher() {
    for (const [key, [ttl, val]] of this.profiles.entries()) {
      if (Date.now() > ttl + this.ttl)
        this.profiles.delete(key);
    }
  }
  
}
