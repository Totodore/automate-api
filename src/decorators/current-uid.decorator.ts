import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { decode } from "jsonwebtoken";
export const CurrentUid = createParamDecorator(async (data: null, context: ExecutionContext) => {

  const req: Request = context.switchToHttp().getRequest();
  const userId = decode(req.headers.authorization.substring(7)) as string;
  return userId;
})