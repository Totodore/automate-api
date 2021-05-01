import { UserOutModel } from './../models/out/user.out.model';
import { DiscordOauthRequest, DiscordUser } from './../models/oauth.model';
import { Controller, Delete, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('user')
@UseGuards(AuthGuard("discord"))
export class UserController {

  @Get()
  public getOne(@Req() req: DiscordOauthRequest): UserOutModel {
    console.log(req.user);
    return new UserOutModel(req.user[0], req.user[1]);
  }

  @Delete()
  public async deleteOne(@Req() req: DiscordOauthRequest) {
    await req.user[1].remove();
  }

}
