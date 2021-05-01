import { DiscordUser } from './../models/oauth.model';
import { User } from './../database/user.entity';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from "passport-discord";
import { VerifyCallback } from 'passport-oauth2';

@Injectable()
export class OauthService extends PassportStrategy(Strategy, 'discord') {

  constructor() {
    super({
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
      scope: ["identify", "guilds", "guilds.join"]
    });
  }

  public async validate(accessToken: string, refreshToken: string, profile: Profile): Promise<DiscordUser> {
    let user = await User.findOne(profile.id);
    if (!user) {
      user = await User.create({
        token: accessToken,
        refreshToken,
        id: profile.id
      }).save();
    }
    return [profile, user];
  }
}
