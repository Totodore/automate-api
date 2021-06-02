import { OauthService } from './../services/oauth.service';
import { createParamDecorator, SetMetadata, ExecutionContext, InternalServerErrorException, HttpException, Inject } from '@nestjs/common';

export const CurrentProfile = createParamDecorator(async (data: null, context: ExecutionContext) => {
  const req = context.switchToHttp().getRequest();
  return req.profile || await OauthService.getProfile(req.user);
  
});
