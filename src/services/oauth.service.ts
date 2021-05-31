import { AppLogger } from './../utils/app-logger.util';
import { DiscordUser, TokenResponse } from './../models/oauth.model';
import { User } from './../database/user.entity';
import { Injectable, HttpService, OnModuleInit } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from "passport-discord";
import { LessThan } from 'typeorm';
import { AxiosResponse, AxiosError } from "axios";

@Injectable()
export class OauthService extends PassportStrategy(Strategy, 'discord') implements OnModuleInit {

  constructor(
    private readonly http: HttpService,
    private readonly logger: AppLogger
  ) {
    super({
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
      scope: ["identify", "guilds"]
    });
  }

  public onModuleInit() {
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
}
