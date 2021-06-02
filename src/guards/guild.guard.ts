import { Reflector } from '@nestjs/core';
import { OauthService } from './../services/oauth.service';
import { User } from './../database/user.entity';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Profile } from 'passport-discord';

@Injectable()
export class GuildGuard implements CanActivate {

  constructor(
    private readonly oauth: OauthService,
    private readonly reflector: Reflector
  ) { }

  /**
   * Determine if the user is a member and if he is admin
   * @param context 
   * @returns a boolean allowing or not the access to the routes
   */
  public async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const userStatus: "admin" | "member" = this.reflector.get("role", context.getHandler());
    console.log(userStatus);
    try {
      const user: User = req.user;
      if (!req.profile) {
        req.profile = await this.oauth.getProfile(user);
      }
      const profile: Profile = req.profile;
      const perms = profile.guilds?.find(el => el.id == req.params.id)?.permissions;
      return (userStatus == "admin" && ((perms & 0x8) === 0x8
      || (perms & 0x10) === 0x10
        || (perms & 0x20) === 0x20))
        || (userStatus == "member" && perms != null);
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}
