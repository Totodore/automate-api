import { createQueryBuilder } from 'typeorm';
import { Guild } from './../database/guild.entity';
import { BotService } from './../services/bot.service';
import { CurrentProfile } from './../decorators/current-profile.decorator';
import { Profile } from 'passport-discord';
import { User } from 'src/database/user.entity';
import { UserGuard } from './../guards/user.guard';
import { Controller, Delete, Get, HttpService, Redirect, Req, Res, UseGuards, UseInterceptors, CacheInterceptor, Post } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import * as jwt from "jsonwebtoken";
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { DiscordProfile } from 'src/models/out/user.out.model';
import { Message } from 'src/database/message.entity';
@Controller('user')
export class UserController {

  constructor(
    private readonly bot: BotService
  ) {}
  
  @Get("me")
  @UseGuards(UserGuard)
  @UseInterceptors(CacheInterceptor)
  public async getMe(@CurrentProfile() profile: DiscordProfile): Promise<Profile> {
    const guilds = (await createQueryBuilder(Guild, 'guild').where("guild.id IN (:...ids)", { ids: profile.guilds.map(el => el.id) }).getMany());
    const guildIds = guilds.map(el => el.id);
    profile.guilds = profile.guilds.filter(guild =>
      (((guild.permissions & 0x8) === 0x8
          || (guild.permissions & 0x10) === 0x10
          || (guild.permissions & 0x20) === 0x20)
        || guilds.find(el => el.id == guild.id)?.scope == true)
      && guildIds.includes(guild.id)  //This condition is to prevent the issue with guild cached when the guild is removed
    ).sort((a, b) => {
      a.added = guildIds.includes(a.id);
      b.added = guildIds.includes(b.id);
      return guildIds.includes(a.id) ? -1 : 1
    });
    profile.joinedServer = await this.bot.isInAutomateDiscord(profile.id);
    return profile;
  }

  
  @Get("me/last")
  @UseGuards(UserGuard)
  @UseInterceptors(CacheInterceptor)
  public async getLastMessages(@CurrentProfile() profile: DiscordProfile): Promise<Message[]> {
    const adminGuildsId = profile.guilds.filter(guild =>
      (guild.permissions & 0x8) === 0x8
      || (guild.permissions & 0x10) === 0x10
      || (guild.permissions & 0x20) === 0x20
    ).map(guild => guild.id);
    return Promise.all((await createQueryBuilder(Message, "msg")
      .where("msg.guildId IN (:guilds)", { guilds: profile.guilds.map(el => el.id) })
      .orderBy("msg.updatedDate", "DESC").take(10)
      .leftJoinAndSelect("msg.guild", "guild")
      .leftJoinAndSelect("msg.creator", "creator")
      .leftJoinAndSelect("msg.files", "files")
      .getMany())
      .filter(msg => msg.guild.scope || adminGuildsId.includes(msg.guild.id))
      .map(async (msg: Message) => {
        msg.channelName = (await this.bot.getChannel(msg.channelId)).name;
        const creator = await this.bot.getUser(msg.creator.id);
        const guild = await this.bot.getGuild(msg.guild.id);
        msg.creator.name = creator.username;
        msg.creator.profile = creator.avatar;
        msg.guild.name = guild.name;
        msg.guild.profile = guild.icon;
        return msg;
      })
    );
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
