import { Profile } from "passport-discord";
import { User } from "src/database/user.entity";

export type DiscordUser = [Profile, User];
export interface DiscordOauthRequest {
  user: DiscordUser;
}
export interface TokenResponse {
  access_token: string,
  token_type: "Bearer",
  expires_in: number,
  refresh_token: string,
  scope: string
}