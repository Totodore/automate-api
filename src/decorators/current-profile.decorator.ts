import { Profile } from 'passport-discord';
import { User } from 'src/database/user.entity';
import { createParamDecorator, SetMetadata, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { decode } from 'jsonwebtoken';
import { GuildInfo } from 'passport-discord';
import axios from "axios";

export const CurrentProfile = createParamDecorator(async (selectGuilds: boolean, context: ExecutionContext) => {

  const req: Request = context.switchToHttp().getRequest();
  const userId = decode(req.headers.authorization.substring(7)) as string;
  
  const user = req.user as User || await User.findOne(userId);
  const profile = (await axios.get<Profile>(`${process.env.API_ENDPOINT}/users/@me`, {
    headers: { Authorization: `Bearer ${user.token}` }
  })).data;
  if (selectGuilds) {
    profile.guilds = (await axios.get<GuildInfo[]>(`${process.env.API_ENDPOINT}/users/@me/guilds`, {
      headers: { Authorization: `Bearer ${user.token}` }
    })).data;
  }
  req.user ??= user;
  return profile;
});
