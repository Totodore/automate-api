import { Const } from './../utils/const.util';
import { AppLogger } from './../utils/app-logger.util';
import { DiscordUser, TokenResponse } from './../models/oauth.model';
import { User } from './../database/user.entity';
import { Injectable, HttpService, OnModuleInit, HttpException, InternalServerErrorException, Inject, CACHE_MANAGER } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, GuildInfo } from "passport-discord";
import { LessThan } from 'typeorm';
import { AxiosResponse, AxiosError } from "axios";
import axios from "axios";
import { Cache } from 'cache-manager';

@Injectable()
export class OauthService extends PassportStrategy(Strategy, 'discord') implements OnModuleInit {

  constructor(
    private readonly http: HttpService,
    private readonly logger: AppLogger,
    @Inject(CACHE_MANAGER) private readonly cache: Cache 
  ) {
    super({
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
      scope: ["identify", "guilds"]
    });
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

  public async getProfile(user: User): Promise<Profile> {
    const cache: Profile = await this.cache.get(user?.id);
    if (cache) return cache;
    const profile: Profile = await new Promise((resolve, reject) =>
      this.userProfile(user.token, (err, profile) => err ? reject(err) : resolve(profile))
    );
    await this.cache.set(user.id, profile);
    return profile;
  }

  public async refreshToken() {
    const users = await User.find({ tokenExpires: LessThan(new Date(Date.now() + 6 * 3600_000)) });
    for (const user of users) {
      try {
        const res: AxiosResponse<TokenResponse> = await this.http.post(`https://discord.com/api/oauth2/token`, 
          new URLSearchParams(Object.entries({
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            grant_type: 'refresh_token',
            refresh_token: user.refreshToken
          }))
        , { headers: { 'Content-Type': 'application/x-www-form-urlencoded'} }).toPromise();
        if (res.status === 200) {
          user.token = res.data.access_token;
          user.refreshToken = res.data.refresh_token;
          user.tokenExpires = new Date(Date.now() + res.data.expires_in * 1000);
        } else {
          this.logger.error("Could not refresh token for user:", user.name);
        }
        await user.save();
      } catch (e) {
        this.logger.error("Could not refresh token for user:", user.name);
        this.logger.error((e as AxiosError).message);
        console.error((e as AxiosError).response.data);
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
