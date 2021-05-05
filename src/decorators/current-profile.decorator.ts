import { AppLogger } from './../utils/app-logger.util';
import { User } from 'src/database/user.entity';
import { createParamDecorator, SetMetadata, ExecutionContext, InternalServerErrorException, HttpException } from '@nestjs/common';
import { Request } from 'express';
import { decode } from 'jsonwebtoken';
import { GuildInfo } from 'passport-discord';
import axios, { AxiosError } from "axios";
import { Profile } from 'passport-discord';

export const CurrentProfile = createParamDecorator(async (selectGuilds: boolean, context: ExecutionContext) => {

  const logger = new AppLogger("CurrentProfile", false);
  const req: Request = context.switchToHttp().getRequest();
  const userId = decode(req.headers.authorization.substring(7)) as string;
  
  const user = req.user as User || await User.findOne(userId);
  let profile: Profile;
  try {
    profile = (await axios.get<Profile>(`${process.env.API_ENDPOINT}/users/@me`, {
      headers: { Authorization: `Bearer ${user.token}` }
    })).data;
    if (selectGuilds) {
      profile.guilds = (await axios.get<GuildInfo[]>(`${process.env.API_ENDPOINT}/users/@me/guilds`, {
        headers: { Authorization: `Bearer ${user.token}` }
      })).data;
    }
    req.user ??= user;
    return profile;
  } catch (e) {
    const error = e as AxiosError;
    logger.error(e, error.response.data.message, "retry in :",error.response.data.retry_after, "s");
    if ((profile && !selectGuilds) || (profile.guilds && selectGuilds))
      return profile;
    else if (error.response.status === 429)
      throw new HttpException("Discord API too many requests", 429);
    else
      throw new InternalServerErrorException();
  }
  
});
