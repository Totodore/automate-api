import { AppLogger } from 'src/utils/app-logger.util';
import { Profile } from 'passport-discord';
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class CacheService implements OnModuleInit {
  
  constructor(
    private readonly logger: AppLogger
  ) { }
  
  private readonly profiles = new Map<string, [number, Profile]>();
  private readonly guilds = new Map<string, [number, Profile]>();
  private readonly ttl = 60_000 * 5;

  public onModuleInit() {
    setInterval(() => this.ttlWatcher(), 1000);
    this.logger.log("Starting cache service with ttl of: ", this.ttl);
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

  public removeGuildFromCache(guildId: string) {
    for (const [key, [ttl, val]] of this.profiles.entries()) {
      const guild = val.guilds.find(el => el.id == guildId);
      if (guild) {
        val.guilds.splice(val.guilds.indexOf(guild), 1);
        this.profiles.set(key, [ttl, val]);
      }
    }
  }


  public ttlWatcher() {
    for (const [key, [ttl, val]] of this.profiles.entries()) {
      if (Date.now() < ttl + 60_000 * 5)
        this.profiles.delete(key);
    }
  }
  
}
