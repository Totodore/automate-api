import { CurrentProfile } from './../decorators/current-profile.decorator';
import { OauthService } from './../services/oauth.service';
import { GuildInfo } from 'passport-discord';
import { AuthOutModel } from './../models/out/user.out.model';
import { Profile } from 'passport-discord';
import { User } from 'src/database/user.entity';
import { UserGuard } from './../guards/user.guard';
import { DiscordOauthRequest, DiscordUser } from './../models/oauth.model';
import { Controller, Delete, Get, HttpService, Redirect, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import * as jwt from "jsonwebtoken";
import { CurrentUser } from 'src/decorators/current-user.decorator';
@Controller('user')
export class UserController {
  
  constructor(
    private readonly httpService: HttpService,
    private readonly oauth: OauthService
  ) { }
  
  @Get("me")
  @UseGuards(UserGuard)
  public async getMe(@CurrentProfile(true) profile: Profile): Promise<Profile> {
    return profile;
  }
  
  @Get("auth")
  @UseGuards(AuthGuard("discord"))
  public async auth(@Req() req: Request, @Res() res: Response): Promise<AuthOutModel> {
    const user = req.user as Profile;
    const token = jwt.sign(user.id, process.env.JWT_SECRET);
    res.redirect(`${process.env.DASHBOARD_URL}?token=${token}`);
    return;
  }
  
  @Delete()
  @UseGuards(UserGuard)
  public async deleteOne(@CurrentUser() user: User) {
    await user.remove();
  }

}
