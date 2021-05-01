import { Profile } from "passport-discord";
import { User } from "src/database/user.entity";

export type DiscordUser = [Profile, User];
export interface DiscordOauthRequest {
  user: DiscordUser;
}