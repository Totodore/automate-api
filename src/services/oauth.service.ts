import { CacheService } from './cache.service';
import { Const } from './../utils/const.util';
import { AppLogger } from './../utils/app-logger.util';
import { DiscordUser, TokenResponse } from './../models/oauth.model';
import { User } from './../database/user.entity';
import { Injectable, HttpService, OnModuleInit, HttpException, InternalServerErrorException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, GuildInfo } from "passport-discord";
import { Between, LessThan } from 'typeorm';
import { AxiosError } from "axios";
import axios from "axios";
import * as refreshDiscordToken from "passport-oauth2-refresh";

@Injectable()
export class OauthService extends PassportStrategy(Strategy, 'discord') implements OnModuleInit {

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
    refreshDiscordToken.use(this);
  }

  public onModuleInit() {
    Const.cache = this.cache;
    setInterval(() => this.refreshToken(), 3600_000);
    this.refreshToken();
    this.logger.log("Oauth refresh token service started!");
  }

  public async validate(accessToken: string, refreshToken: string, profile: Profile): Promise<DiscordUser> {
    let user = await User.findOne(profile.id);
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
    const cache: Profile = await this.cache.get(user?.id);
    if (cache) return cache;
    const profile: Profile = await new Promise((resolve, reject) =>
      this.userProfile(user.token, (err, profile) => err ? reject(err) : resolve(profile))
    );
    this.cache.set(user.id, profile);
    return profile;
  }

  public async refreshToken() {
    const users = await User.find({ tokenExpires: Between(new Date(), new Date(Date.now() + 6 * 3600_000)) });
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
      }
    }
  }

  public static async getProfile(user: User): Promise<Profile> {
    const cache: Profile = await Const.cache.get(user.id);
    if (cache)
      return cache;
    const logger = new AppLogger("GetProfile");
    let profile: Profile;
    try {
      profile = (await axios.get<Profile>(`${process.env.API_ENDPOINT}/users/@me`, {
        headers: { Authorization: `Bearer ${user.token}` }
      })).data;
      profile.guilds = (await axios.get<GuildInfo[]>(`${process.env.API_ENDPOINT}/users/@me/guilds`, {
        headers: { Authorization: `Bearer ${user.token}` }
      })).data;
      return profile;
    } catch (e) {
      const error = e as AxiosError;
      logger.error(e, error.response.data.message, "retry in :",error.response.data.retry_after, "s");
      if (profile?.guilds)
        return profile;
      else if (error.response.status === 429)
        throw new HttpException("Discord API too many requests", 429);
      else
        throw new InternalServerErrorException();
    } finally {
      await Const.cache.set(user.id, profile);
    }
  }
}
