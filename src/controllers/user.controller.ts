import { createQueryBuilder } from 'typeorm';
import { Guild } from './../database/guild.entity';
import { BotService } from './../services/bot.service';
import { CurrentProfile } from './../decorators/current-profile.decorator';
import { Profile } from 'passport-discord';
import { User } from 'src/database/user.entity';
import { UserGuard } from './../guards/user.guard';
import { Controller, Delete, Get, HttpService, Redirect, Req, Res, UseGuards, UseInterceptors, CacheInterceptor } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import * as jwt from "jsonwebtoken";
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { DiscordProfile } from 'src/models/out/user.out.model';
@Controller('user')
export class UserController {

  constructor(
    private readonly bot: BotService
  ) {}
  
  @Get("me")
  @UseGuards(UserGuard)
  @UseInterceptors(CacheInterceptor)
  public async getMe(@CurrentProfile(true) profile: DiscordProfile): Promise<Profile> {
    const guilds = (await createQueryBuilder(Guild, 'guild').where("guild.id IN (:...ids)", { ids: profile.guilds.map(el => el.id) }).getMany());
    const guildIds = guilds.map(el => el.id);
    profile.guilds = profile.guilds.filter(guild =>
      ((guild.permissions & 0x8) === 8
        || (guild.permissions & 0x10) === 10
        || (guild.permissions & 0x20) === 20)
      || guilds.find(el => el.id == guild.id)?.scope == true
    ).sort((a, b) => {
      a.added = guildIds.includes(a.id);
      b.added = guildIds.includes(b.id);
      return guildIds.includes(a.id) ? -1 : 1
    });
    profile.joinedServer = await this.bot.isInAutomateDiscord(profile.id);
    return profile;
  }
  
  @Get("auth")
  @UseGuards(AuthGuard("discord"))
  public async auth(@Req() req: Request, @Res() res: Response) {
    const user = req.user as Profile;
    const token = jwt.sign(user.id, process.env.JWT_SECRET);
    res.redirect(`${process.env.DASHBOARD_URL}?token=${token}`);
  }
  
  @Delete()
  @UseGuards(UserGuard)
  public async deleteOne(@CurrentUser() user: User) {
    await user.remove();
  }

}
