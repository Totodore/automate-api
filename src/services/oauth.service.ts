import { DiscordUser } from './../models/oauth.model';
import { User } from './../database/user.entity';
import { Injectable, HttpService } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from "passport-discord";

@Injectable()
export class OauthService extends PassportStrategy(Strategy, 'discord') {

  constructor(
    private readonly http: HttpService
  ) {
    super({
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
      scope: ["identify", "guilds"]
    });
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
}
