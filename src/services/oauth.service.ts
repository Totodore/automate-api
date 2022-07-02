import { CacheService } from './cache.service';
import { AppLogger } from './../utils/app-logger.util';
import { DiscordUser } from './../models/oauth.model';
import { User } from './../database/user.entity';
import { Injectable, OnModuleInit, HttpException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, InternalOAuthError } from "passport-discord";
import { Between } from 'typeorm';
import * as refreshDiscordToken from "passport-oauth2-refresh";

@Injectable()
export class OauthService extends PassportStrategy(Strategy, 'discord') implements OnModuleInit {

  public static instance: OauthService;
  constructor(
    private readonly logger: AppLogger,
    private readonly cache: CacheService
  ) {
    super({
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
      scope: ["identify", "guilds"],
    });
    OauthService.instance = this;
    refreshDiscordToken.use(this);
  }

  public onModuleInit() {
    setInterval(() => this.refreshToken(), 3600_000);
    this.refreshToken();
    this.logger.log("Oauth refresh token service started!");
  }

  public async validate(accessToken: string, refreshToken: string, profile: Profile): Promise<DiscordUser> {
    let user = await User.findOne({ where: { id: profile.id } });
    if (!user) {
      user = await User.create({
        token: accessToken,
        refreshToken,
        id: profile.id,
        tokenExpires: new Date(Date.now() + 1000 * 3600 * 24 * 7)
      }).save();
    } else if (user.tokenExpires < new Date()) {
      user.tokenExpires = new Date(Date.now() + 1000 * 3600 * 24 * 7);
      user.refreshToken = refreshToken;
      user.token = accessToken;
      await user.save();
    }
    return [profile, user];
  }

  /**
   * Get the profile of a user, if the value is in cache it is directly returned.
   * If not we get the user profile from the discord api
   * @param user 
   * @returns 
   */
  public async getProfile(user: User): Promise<Profile> {
    try {
      const cache: Profile = this.cache.get(user?.id);
      if (cache) return cache;
      const profile: Profile = await new Promise((resolve, reject) =>
        this.userProfile(user.token, (err, profile) => err ? reject(err) : resolve(profile))
      );
      this.cache.set(user.id, profile);
      return profile;
    } catch (e) {
      console.error(e);
      if (e instanceof InternalOAuthError) {
        if (e?.oauthError?.statusCode == 429) {
          this.logger.error("Discord rate limiting, retry after: " + e?.oauthError.data.retry_after);
          throw new HttpException("Discord API too many requests", 429);
        }
      } else
        throw e;
    }
  }

  public async refreshToken() {
    const users = await User.find({
      where: { tokenExpires: Between(new Date(), new Date(Date.now() + 6 * 3600_000)) }
    });
    for (const user of users) {
      try {
        const [accessToken, refreshToken] = await new Promise(
          (resolve, reject) => refreshDiscordToken.requestNewAccessToken('discord', user.refreshToken,
            (err, accessToken, refreshToken) => err ? reject(err) : resolve([accessToken, refreshToken])
          )
        );
        user.token = accessToken;
        user.refreshToken = refreshToken;
        user.tokenExpires = new Date(Date.now() + 1000 * 3600 * 24 * 7);
        await user.save();
      } catch (e) {
        this.logger.error("Could not refresh token for user:", user.id);
        console.error(e);
        try {
          if (typeof e?.data === "string" && JSON.parse(e?.data)?.error == "invalid_grant") {
            this.logger.error("Removing user because of invalid grant...");
            await User.remove(user);
          }
        } catch { }
      }
    }
  }
}
