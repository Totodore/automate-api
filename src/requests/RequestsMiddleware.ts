import { Request } from "express";
import { GuildDataModel } from "src/models/GuildModel";
import { UserDataModel } from "src/models/UserModel";
import DBManager from "src/utils/DBManager";
import { MessageType } from "../models/MessageModel";

interface SessionRequest extends Request {
    session: {
        userId: string;
    },
    headerData: {
        username: string;
        avatar: string; //Link to the avatar image
    },
    dbManager?: DBManager;
    
    addMessage?: (query: any, type: MessageType) => Promise<string>;
    addUser?: (data: UserDataModel) => Promise<void>;
    addGuild?: (data: GuildDataModel) => Promise<void>;
    isOverMessageLimit?: (guildId: string) => Promise<boolean>;
    updateTimezone?: (guildId: string, timezone_code: string, timezone: string) => Promise<void>;
    updateMessage?: (messageId: string, content: string, sys_content: string) => Promise<void>;
    getUser?: (userId: string) => Promise<UserDataModel>;
    hasGuild?: (guildId: string) => Promise<boolean>;
    hasUser?: (userId: string) => Promise<boolean>;
}


interface DiscordRequest extends SessionRequest {
    getUserDiscord: (token: string) => Promise<any>;
    getDiscordToken: (data: any) => Promise<any>;
    addBotDiscord: (data: any) => Promise<any>;
    getUserGuildsDiscord: (token: string) => Promise<any>;
}
export { SessionRequest, DiscordRequest };