import { User } from 'src/database/user.entity';
import { createParamDecorator, SetMetadata, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { decode } from 'jsonwebtoken';

export const CurrentUser = createParamDecorator(async (data: null, context: ExecutionContext) => {

  const req: Request = context.switchToHttp().getRequest();
  const userId = decode(req.headers.authorization.substring(7)) as string;
  
  const user = req.user || await User.findOne(userId);
  req.user ??= user;
  return user;
});
