import { Profile } from 'passport-discord';
export class AuthOutModel {

  constructor(
    public readonly token: string,
    public readonly profile: Profile
  ) {}
}