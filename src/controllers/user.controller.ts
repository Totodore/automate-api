import { CurrentProfile } from './../decorators/current-profile.decorator';
import { OauthService } from './../services/oauth.service';
import { Profile } from 'passport-discord';
import { User } from 'src/database/user.entity';
import { UserGuard } from './../guards/user.guard';
import { Controller, Delete, Get, HttpService, Redirect, Req, Res, UseGuards, UseInterceptors, CacheInterceptor } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import * as jwt from "jsonwebtoken";
import { CurrentUser } from 'src/decorators/current-user.decorator';
@Controller('user')
export class UserController {
  
  @Get("me")
  @UseGuards(UserGuard)
  @UseInterceptors(CacheInterceptor)
  public async getMe(@CurrentProfile(true) profile: Profile): Promise<Profile> {
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
