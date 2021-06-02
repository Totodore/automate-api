import { User } from 'src/database/user.entity';
import { createParamDecorator, SetMetadata, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const CurrentUser = createParamDecorator(async (data: null, context: ExecutionContext) => {
  const req: Request = context.switchToHttp().getRequest();
  return req.user as User;
});
