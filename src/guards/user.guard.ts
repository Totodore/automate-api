import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { verify } from 'jsonwebtoken';

@Injectable()
export class UserGuard implements CanActivate {

  /** 
   * Guard which verify the user jwt token 
   */
  public canActivate(context: ExecutionContext) {
    const auth: string = context.switchToHttp().getRequest().headers.authorization || context.switchToHttp().getRequest().query.token;
    const token = auth?.startsWith("Bearer ") ? auth.substring(7) : auth;
    try {
      verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return false;
    }
    return true;
  }
}
