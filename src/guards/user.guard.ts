import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { decode, verify } from 'jsonwebtoken';
import { User } from 'src/database/user.entity';

@Injectable()
export class UserGuard implements CanActivate {

  /** 
   * Guard which verify the user jwt token 
   */
  public async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const auth: string = req.headers.authorization || req.query.token;
    const token = auth?.startsWith("Bearer ") ? auth.substring(7) : auth;
    try {
      verify(token, process.env.JWT_SECRET);
      try {
        const userId = decode(token) as string;
        req.user ??= await User.findOne(userId);
      } catch (e) {
        console.error(e);
        return false;
      }
    } catch (e) {
      return false;
    }
    return true;
  }
}
